import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Cakto-Signature",
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
    const CAKTO_WEBHOOK_SECRET = Deno.env.get('CAKTO_WEBHOOK_SECRET') // Adicione esta variável

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

    // Verificar assinatura do webhook (segurança)
    const signature = req.headers.get('X-Cakto-Signature')
    const payload = await req.text()
    
    console.log('Cakto Webhook: Received payload', {
      signature: signature ? 'present' : 'missing',
      payloadLength: payload.length,
      webhookId: 'd1554ce2-12b8-47bf-bd82-7767c82002a0'
    })

    // TODO: Implementar verificação de assinatura para segurança
    // if (CAKTO_WEBHOOK_SECRET && signature) {
    //   const isValid = await verifyWebhookSignature(payload, signature, CAKTO_WEBHOOK_SECRET)
    //   if (!isValid) {
    //     console.error('Invalid webhook signature')
    //     return new Response(JSON.stringify({ error: 'Invalid signature' }), {
    //       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //       status: 401,
    //     })
    //   }
    // }

    let webhookData
    try {
      webhookData = JSON.parse(payload)
    } catch (error) {
      console.error('Invalid JSON payload:', error)
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('Cakto Webhook: Parsed data', webhookData)

    // Processar diferentes tipos de eventos do Cakto
    const eventType = webhookData.event || webhookData.type || webhookData.status
    const paymentData = webhookData.data || webhookData

    console.log('Cakto Webhook: Processing event', {
      eventType,
      paymentId: paymentData.id || paymentData.payment_id,
      amount: paymentData.amount,
      status: paymentData.status
    })

    // Eventos de pagamento aprovado/completado
    if (isPaymentCompletedEvent(eventType, paymentData)) {
      const result = await processPaymentCompleted(supabaseClient, paymentData)
      
      if (!result.success) {
        console.error('Failed to process payment completion:', result.error)
        return new Response(JSON.stringify({ 
          error: 'Failed to process payment',
          details: result.error 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log('Payment processed successfully:', result)
      
      return new Response(JSON.stringify({ 
        received: true, 
        message: 'Payment processed successfully',
        userId: result.userId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Eventos de pagamento falhado/cancelado
    if (isPaymentFailedEvent(eventType, paymentData)) {
      const result = await processPaymentFailed(supabaseClient, paymentData)
      
      console.log('Payment failure processed:', result)
      
      return new Response(JSON.stringify({ 
        received: true, 
        message: 'Payment failure processed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Outros eventos (log apenas)
    console.log('Cakto Webhook: Unhandled event type', {
      eventType,
      paymentData: paymentData ? Object.keys(paymentData) : 'no data'
    })

    return new Response(JSON.stringify({ 
      received: true, 
      message: 'Event logged but not processed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Cakto Webhook: Error processing webhook', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function isPaymentCompletedEvent(eventType: string, paymentData: any): boolean {
  const completedEvents = [
    'payment.completed',
    'payment.approved',
    'payment.paid',
    'pix.paid',
    'pix.completed',
    'transaction.completed',
    'order.completed'
  ]
  
  const completedStatuses = [
    'completed',
    'approved',
    'paid',
    'success',
    'confirmed'
  ]
  
  return completedEvents.includes(eventType?.toLowerCase()) || 
         completedStatuses.includes(paymentData?.status?.toLowerCase())
}

function isPaymentFailedEvent(eventType: string, paymentData: any): boolean {
  const failedEvents = [
    'payment.failed',
    'payment.cancelled',
    'payment.expired',
    'pix.failed',
    'pix.expired',
    'transaction.failed'
  ]
  
  const failedStatuses = [
    'failed',
    'cancelled',
    'expired',
    'rejected',
    'error'
  ]
  
  return failedEvents.includes(eventType?.toLowerCase()) || 
         failedStatuses.includes(paymentData?.status?.toLowerCase())
}

async function processPaymentCompleted(supabaseClient: any, paymentData: any) {
  try {
    // Identificar o pagamento - pode ser por ID do Cakto ou referência externa
    const caktoPaymentId = paymentData.id || paymentData.payment_id || paymentData.transaction_id
    const externalReference = paymentData.external_reference || paymentData.reference
    
    console.log('Processing payment completion:', {
      caktoPaymentId,
      externalReference,
      amount: paymentData.amount
    })

    let paymentRecord = null

    // Tentar encontrar o pagamento por ID do Cakto
    if (caktoPaymentId) {
      const { data, error } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('cakto_payment_id', caktoPaymentId)
        .maybeSingle()

      if (!error && data) {
        paymentRecord = data
      }
    }

    // Se não encontrou, tentar por referência externa (user_id)
    if (!paymentRecord && externalReference) {
      const { data, error } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('user_id', externalReference)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        paymentRecord = data
      }
    }

    // Se ainda não encontrou, criar um novo registro baseado nos dados do webhook
    if (!paymentRecord) {
      console.log('Payment record not found, creating new one from webhook data')
      
      // Extrair user_id da referência externa ou outros campos
      const userId = externalReference || paymentData.customer?.id || paymentData.user_id
      
      if (!userId) {
        return { 
          success: false, 
          error: 'Cannot identify user from payment data' 
        }
      }

      const { data: newPayment, error: createError } = await supabaseClient
        .from('payments')
        .insert({
          user_id: userId,
          cakto_payment_id: caktoPaymentId,
          amount: paymentData.amount || 25.00,
          currency: 'BRL',
          description: 'UpDuo Premium - Pagamento via Cakto',
          status: 'completed'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating payment record:', createError)
        return { success: false, error: createError.message }
      }

      paymentRecord = newPayment
    } else {
      // Atualizar pagamento existente
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ 
          status: 'completed',
          cakto_payment_id: caktoPaymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id)

      if (updateError) {
        console.error('Error updating payment status:', updateError)
        return { success: false, error: updateError.message }
      }
    }

    // Ativar premium para o usuário
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        is_premium: true,
        premium_activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.user_id)

    if (profileError) {
      console.error('Error updating user premium status:', profileError)
      return { success: false, error: profileError.message }
    }

    console.log(`Payment completed successfully for user ${paymentRecord.user_id}`)

    return { 
      success: true, 
      userId: paymentRecord.user_id,
      paymentId: paymentRecord.id
    }

  } catch (error) {
    console.error('Error in processPaymentCompleted:', error)
    return { success: false, error: error.message }
  }
}

async function processPaymentFailed(supabaseClient: any, paymentData: any) {
  try {
    const caktoPaymentId = paymentData.id || paymentData.payment_id || paymentData.transaction_id
    
    if (!caktoPaymentId) {
      return { success: true, message: 'No payment ID to process' }
    }

    // Atualizar status do pagamento para failed
    const { error } = await supabaseClient
      .from('payments')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('cakto_payment_id', caktoPaymentId)

    if (error) {
      console.error('Error updating payment to failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Payment marked as failed' }

  } catch (error) {
    console.error('Error in processPaymentFailed:', error)
    return { success: false, error: error.message }
  }
}