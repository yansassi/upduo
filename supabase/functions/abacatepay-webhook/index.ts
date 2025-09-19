import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables')
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const payload = await req.json()
    console.log('Received AbacatePay webhook:', payload)

    // TODO: Implement webhook signature verification here
    // This is crucial for security. Check AbacatePay documentation for details.
    // Example:
    // const signature = req.headers.get('X-AbacatePay-Signature')
    // if (!isValidSignature(payload, signature, ABACATEPAY_WEBHOOK_SECRET)) {
    //   return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 401 })
    // }

    // Handle different webhook events
    const eventType = payload.event || payload.type
    const paymentData = payload.data || payload

    console.log('Processing webhook event:', eventType, paymentData)

    // Handle payment completion
    if ((eventType === 'billing.paid' || eventType === 'payment.paid' || eventType === 'pix.paid' || eventType === 'payment.completed' || eventType === 'pixQrCode.paid') && paymentData && paymentData.id) {
      const abacatepayPaymentId = paymentData.id
      const newStatus = 'completed'

      console.log('Processing payment completion for:', abacatepayPaymentId)

      // Update the payment record in the 'payments' table
      const { data: updatedPayment, error: updatePaymentError } = await supabaseClient
        .from('payments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('abacatepay_payment_id', abacatepayPaymentId)
        .select('user_id')
        .single()

      if (updatePaymentError || !updatedPayment) {
        console.error('Error updating payment status in DB:', updatePaymentError)
        return new Response(JSON.stringify({ error: 'Failed to update payment status' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        })
      }

      console.log('Payment updated, setting user as premium:', updatedPayment.user_id)

      // Update the user's profile to set them as premium
      const { error: updateProfileError } = await supabaseClient
        .from('profiles')
        .update({ 
          is_premium: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPayment.user_id)

      if (updateProfileError) {
        console.error('Error updating user premium status:', updateProfileError)
        return new Response(JSON.stringify({ error: 'Failed to update user premium status' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        })
      }

      console.log(`Payment ${abacatepayPaymentId} completed. User ${updatedPayment.user_id} is now premium.`)
      
      return new Response(JSON.stringify({ 
        received: true, 
        message: 'Payment processed successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else if (eventType === 'payment.failed' || eventType === 'payment.cancelled' || eventType === 'pix.expired' || eventType === 'pixQrCode.expired' || eventType === 'pixQrCode.failed') {
      // Handle payment failure/cancellation
      const abacatepayPaymentId = paymentData.id
      const newStatus = eventType === 'pix.expired' ? 'failed' : 'failed'

      console.log('Processing payment failure for:', abacatepayPaymentId, 'Event:', eventType)

      // Update the payment record status
      const { error: updatePaymentError } = await supabaseClient
        .from('payments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('abacatepay_payment_id', abacatepayPaymentId)

      if (updatePaymentError) {
        console.error('Error updating payment status to failed:', updatePaymentError)
      }

      return new Response(JSON.stringify({ 
        received: true, 
        message: 'Payment failure processed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      console.log('Unhandled webhook event type or missing data:', eventType, paymentData)
      return new Response(JSON.stringify({ 
        received: true, 
        message: 'Event type not handled or incomplete data' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
  } catch (error) {
    console.error('Webhook Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})