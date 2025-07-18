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

    // Parâmetros da requisição
    const body = await req.json().catch(() => ({}))
    const daysInactive = body.daysInactive || 7 // Padrão: 7 dias

    console.log(`Checking for users inactive for ${daysInactive} days`)

    // Buscar usuários inativos
    const { data: inactiveUsers, error: fetchError } = await supabaseClient
      .rpc('find_inactive_users', { days_inactive: daysInactive })

    if (fetchError) {
      console.error('Error finding inactive users:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to find inactive users' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(JSON.stringify({
        message: 'No inactive users found',
        inactiveUsers: 0,
        notificationsCreated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Found ${inactiveUsers.length} inactive users`)

    // Criar notificações para usuários inativos
    const notifications = inactiveUsers.map(user => ({
      user_id: user.user_id,
      email_type: 'inactive_user',
      recipient_email: user.email,
      subject: '🎮 Sentimos sua falta no UpDuo!',
      template_data: {
        user_name: user.name,
        days_inactive: user.days_since_activity,
        last_activity: user.last_activity
      },
      status: 'pending'
    }))

    const { data: createdNotifications, error: insertError } = await supabaseClient
      .from('email_notifications')
      .insert(notifications)
      .select('id')

    if (insertError) {
      console.error('Error creating notifications:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create notifications' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log(`Created ${createdNotifications?.length || 0} notifications for inactive users`)

    return new Response(JSON.stringify({
      message: 'Inactive users processed',
      inactiveUsers: inactiveUsers.length,
      notificationsCreated: createdNotifications?.length || 0,
      users: inactiveUsers.map(user => ({
        name: user.name,
        email: user.email,
        daysInactive: user.days_since_activity
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Check Inactive Users Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})