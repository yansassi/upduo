import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') // Você precisará configurar isso

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // Buscar notificações pendentes
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50) // Processar até 50 por vez

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No pending notifications',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Processing ${pendingNotifications.length} pending notifications`)

    let successCount = 0
    let errorCount = 0

    // Processar cada notificação
    for (const notification of pendingNotifications) {
      try {
        const template = generateEmailTemplate(notification.email_type, notification.template_data)
        
        // Se você usar Resend (recomendado)
        if (RESEND_API_KEY) {
          const emailResult = await sendEmailWithResend(
            RESEND_API_KEY,
            notification.recipient_email,
            template.subject,
            template.html,
            template.text
          )

          if (emailResult.success) {
            await supabaseClient
              .from('email_notifications')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', notification.id)
            
            successCount++
            console.log(`Email sent successfully to ${notification.recipient_email}`)
          } else {
            await supabaseClient
              .from('email_notifications')
              .update({ 
                status: 'failed',
                error_message: emailResult.error
              })
              .eq('id', notification.id)
            
            errorCount++
            console.error(`Failed to send email to ${notification.recipient_email}:`, emailResult.error)
          }
        } else {
          // Fallback: apenas marcar como enviado (para desenvolvimento)
          await supabaseClient
            .from('email_notifications')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id)
          
          successCount++
          console.log(`Email marked as sent (no email service configured): ${notification.recipient_email}`)
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        
        await supabaseClient
          .from('email_notifications')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id)
        
        errorCount++
      }
    }

    return new Response(JSON.stringify({
      message: 'Notifications processed',
      processed: pendingNotifications.length,
      successful: successCount,
      failed: errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Send Email Notifications Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function generateEmailTemplate(emailType: string, templateData: any): EmailTemplate {
  const baseUrl = 'https://upduo.top' // Substitua pela sua URL

  switch (emailType) {
    case 'new_match':
      return {
        subject: '💕 Você tem um novo match no UpDuo!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Novo Match!</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💕 Novo Match!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; margin-bottom: 20px;">Olá, ${templateData.user_name}!</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                🎉 Você tem um novo match com <strong>${templateData.match_name}</strong>! 
                Vocês se curtiram mutuamente e agora podem conversar.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  💬 Iniciar Conversa
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Não perca tempo! Comece a conversa e encontre seu duo perfeito no Mobile Legends.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>UpDuo - Encontre seu duo no Mobile Legends</p>
              <p>
                <a href="${baseUrl}/unsubscribe" style="color: #666;">Cancelar notificações</a>
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Olá, ${templateData.user_name}!

🎉 Você tem um novo match com ${templateData.match_name}! 
Vocês se curtiram mutuamente e agora podem conversar.

Acesse o UpDuo para iniciar a conversa: ${baseUrl}

Não perca tempo! Comece a conversa e encontre seu duo perfeito no Mobile Legends.

UpDuo - Encontre seu duo no Mobile Legends
        `
      }

    case 'new_message':
      return {
        subject: '💬 Nova mensagem no UpDuo!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova Mensagem!</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💬 Nova Mensagem!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; margin-bottom: 20px;">Olá, ${templateData.receiver_name}!</p>
              
              <p style="font-size: 16px; margin-bottom: 15px;">
                <strong>${templateData.sender_name}</strong> enviou uma nova mensagem:
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #4facfe; margin: 20px 0;">
                <p style="margin: 0; font-style: italic; color: #555;">
                  "${templateData.message_preview}"
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  💬 Responder Agora
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Não deixe seu match esperando! Responda e continue a conversa.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>UpDuo - Encontre seu duo no Mobile Legends</p>
              <p>
                <a href="${baseUrl}/unsubscribe" style="color: #666;">Cancelar notificações</a>
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Olá, ${templateData.receiver_name}!

${templateData.sender_name} enviou uma nova mensagem:
"${templateData.message_preview}"

Acesse o UpDuo para responder: ${baseUrl}

Não deixe seu match esperando! Responda e continue a conversa.

UpDuo - Encontre seu duo no Mobile Legends
        `
      }

    case 'inactive_user':
      return {
        subject: '🎮 Sentimos sua falta no UpDuo!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sentimos sua falta!</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎮 Sentimos sua falta!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; margin-bottom: 20px;">Olá, ${templateData.user_name}!</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                Notamos que você não acessa o UpDuo há alguns dias. 
                Que tal voltar e encontrar novos duos para suas partidas?
              </p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">🔥 Novidades te esperando:</h3>
                <ul style="color: #555; padding-left: 20px;">
                  <li>Novos jogadores se cadastraram</li>
                  <li>Algoritmo de compatibilidade melhorado</li>
                  <li>Novos recursos Premium disponíveis</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🎮 Voltar ao UpDuo
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Seu duo perfeito pode estar te esperando! Não perca a chance de encontrar novos companheiros de jogo.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>UpDuo - Encontre seu duo no Mobile Legends</p>
              <p>
                <a href="${baseUrl}/unsubscribe" style="color: #666;">Cancelar notificações</a>
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Olá, ${templateData.user_name}!

Sentimos sua falta no UpDuo! Notamos que você não acessa há alguns dias.

🔥 Novidades te esperando:
- Novos jogadores se cadastraram
- Algoritmo de compatibilidade melhorado  
- Novos recursos Premium disponíveis

Acesse agora: ${baseUrl}

Seu duo perfeito pode estar te esperando! Não perca a chance de encontrar novos companheiros de jogo.

UpDuo - Encontre seu duo no Mobile Legends
        `
      }

    default:
      return {
        subject: 'Notificação do UpDuo',
        html: '<p>Você tem uma nova notificação do UpDuo!</p>',
        text: 'Você tem uma nova notificação do UpDuo!'
      }
  }
}

async function sendEmailWithResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UpDuo <noreply@upduo.top>', // Configure seu domínio
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}