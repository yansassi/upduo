import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { amount, description, userId, customerName, customerEmail, customerCellphone, customerTaxId, isTest = false } = await req.json()

    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY')
    const ABACATEPAY_API_URL = Deno.env.get('ABACATEPAY_API_URL') || 'https://api.abacatepay.com/v1'
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Environment check:', {
      hasApiKey: !!ABACATEPAY_API_KEY,
      apiUrl: ABACATEPAY_API_URL,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    })

    if (!ABACATEPAY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables')
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // Validate required customer data
    if (!customerName || !customerEmail || !customerCellphone || !customerTaxId) {
      console.error('Missing customer data:', { customerName, customerEmail, customerCellphone, customerTaxId })
      return new Response(JSON.stringify({ error: 'Missing customer data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount)
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Validate userId
    if (!userId) {
      console.error('Missing userId')
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create PIX payment with AbacatePay
    const paymentPayload = {
      amount: Math.round(amount * 100), // AbacatePay expects amount in cents
      expiresIn: 3600, // 1 hour
      description: description || 'UpDuo Premium - Assinatura Mensal',
      customer: {
        name: customerName,
        email: customerEmail,
        cellphone: customerCellphone,
        taxId: customerTaxId,
      },
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    }

    console.log('Creating PIX payment with AbacatePay...')
    console.log('Payment payload:', paymentPayload)
    
    const abacatepayResponse = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/create`, options)
    const abacatepayData = await abacatepayResponse.json()

    console.log('AbacatePay response status:', abacatepayResponse.status)
    console.log('AbacatePay response data:', abacatepayData)

    if (!abacatepayResponse.ok) {
      console.error('AbacatePay API error:', abacatepayData)
      return new Response(JSON.stringify({ 
        error: abacatepayData.message || 'Failed to create PIX payment',
        details: abacatepayData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: abacatepayResponse.status,
      })
    }

    // Validate AbacatePay response
    if (!abacatepayData.id) {
      console.error('AbacatePay response missing payment ID:', abacatepayData)
      return new Response(JSON.stringify({ 
        error: 'Invalid payment response from AbacatePay',
        details: abacatepayData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Store payment details in database
    const paymentRecord = {
      user_id: userId,
      abacatepay_payment_id: abacatepayData.id,
      amount: amount,
      currency: 'BRL',
      description: description || 'UpDuo Premium - Assinatura Mensal',
      status: 'pending',
      qr_code_data: abacatepayData.qrCode?.payload || abacatepayData.payload,
      qr_code_image_url: abacatepayData.qrCode?.imageUrl || abacatepayData.imageUrl,
    }

    console.log('Saving payment record to database:', paymentRecord)

    const { data: savedPayment, error: dbError } = await supabaseClient
      .from('payments')
      .insert(paymentRecord)
      .select()
      .single()

    if (dbError) {
      console.error('Error saving payment to DB:', dbError)
      return new Response(JSON.stringify({ 
        error: 'Failed to save payment record',
        details: dbError
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('Payment record saved successfully:', savedPayment)

    // If this is a test payment, simulate payment completion
    if (isTest) {
      console.log('Test mode: Simulating payment completion...')
      
      try {
        const simulateOptions = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metadata: {
              paymentId: abacatepayData.id
            }
          }),
        }

        const simulateResponse = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/simulate-payment`, simulateOptions)
        const simulateData = await simulateResponse.json()
        
        console.log('Payment simulation response:', simulateData)
        
        if (simulateResponse.ok) {
          // Update payment status to completed for test
          const { error: updateError } = await supabaseClient
            .from('payments')
            .update({ status: 'completed' })
            .eq('id', savedPayment.id)

          if (!updateError) {
            // Update user to premium
            await supabaseClient
              .from('profiles')
              .update({ is_premium: true })
              .eq('id', userId)
          }
        }
      } catch (simulateError) {
        console.error('Error simulating payment:', simulateError)
        // Continue with normal flow even if simulation fails
      }
    }

    const responseData = {
      id: abacatepayData.id,
      qrCode: {
        payload: abacatepayData.qrCode?.payload || abacatepayData.payload,
        imageUrl: abacatepayData.qrCode?.imageUrl || abacatepayData.imageUrl
      },
      amount: amount,
      status: isTest ? 'completed' : 'pending',
      paymentRecordId: savedPayment.id,
      isTest: isTest
    }

    console.log('Returning response data:', responseData)

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})