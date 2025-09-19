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
    const { paymentId } = await req.json()

    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY')
    const ABACATEPAY_API_URL = Deno.env.get('ABACATEPAY_API_URL') || 'https://api.abacatepay.com/v1'
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ABACATEPAY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables')
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'Missing paymentId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // Check payment status with AbacatePay
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
    }

    console.log('Checking payment status with AbacatePay for payment:', paymentId)
    
    const abacatepayResponse = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/check?id=${paymentId}`, options)
    const abacatepayData = await abacatepayResponse.json()

    console.log('AbacatePay status check response:', abacatepayData)

    if (!abacatepayResponse.ok) {
      console.error('AbacatePay API error:', abacatepayData)
      return new Response(JSON.stringify({ 
        error: abacatepayData.message || 'Failed to check payment status',
        details: abacatepayData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: abacatepayResponse.status,
      })
    }

    // Update local payment record if status changed
    if (abacatepayData.status === 'paid' || abacatepayData.status === 'completed') {
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('user_id, status')
        .eq('abacatepay_payment_id', paymentId)
        .single()

      if (!paymentError && payment && payment.status !== 'completed') {
        // Update payment status
        await supabaseClient
          .from('payments')
          .update({ status: 'completed' })
          .eq('abacatepay_payment_id', paymentId)

        // Update user to premium
        await supabaseClient
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', payment.user_id)

        console.log('Payment completed and user updated to premium:', payment.user_id)
      }
    }

    return new Response(JSON.stringify({
      paymentId: paymentId,
      status: abacatepayData.status,
      abacatePayData: abacatepayData
    }), {
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