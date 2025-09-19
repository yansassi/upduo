import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length,
  urlValid: supabaseUrl?.includes('supabase.co'),
  keyValid: supabaseAnonKey?.startsWith('eyJ')
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          name: string
          state_abbr: string
          region: string
        }
        Insert: {
          id: string
          name: string
          state_abbr: string
          region: string
        }
        Update: {
          id?: string
          name?: string
          state_abbr?: string
          region?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          age: number
          country: string
          city: string
          current_rank: string
          favorite_heroes: string[]
          favorite_lines: string[]
          bio: string
          avatar_url: string | null
          is_premium: boolean
          diamond_count: number
          created_at: string
          updated_at: string
          min_age_filter: number
          max_age_filter: number
          selected_ranks_filter: string[]
          selected_states_filter: string[]
          selected_cities_filter: string[]
          selected_lanes_filter: string[]
          selected_heroes_filter: string[]
          compatibility_mode_filter: boolean
        }
        Insert: {
          id: string
          email: string
          name: string
          age: number
          country?: string
          city: string
          current_rank: string
          favorite_heroes: string[]
          favorite_lines: string[]
          bio?: string
          avatar_url?: string | null
          is_premium?: boolean
          diamond_count?: number
          created_at?: string
          updated_at?: string
          min_age_filter?: number
          max_age_filter?: number
          selected_ranks_filter?: string[]
          selected_states_filter?: string[]
          selected_cities_filter?: string[]
          selected_lanes_filter?: string[]
          selected_heroes_filter?: string[]
          compatibility_mode_filter?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          age?: number
          country?: string
          city?: string
          current_rank?: string
          favorite_heroes?: string[]
          favorite_lines?: string[]
          bio?: string
          avatar_url?: string | null
          is_premium?: boolean
          diamond_count?: number
          updated_at?: string
          min_age_filter?: number
          max_age_filter?: number
          selected_ranks_filter?: string[]
          selected_states_filter?: string[]
          selected_cities_filter?: string[]
          selected_lanes_filter?: string[]
          selected_heroes_filter?: string[]
          compatibility_mode_filter?: boolean
        }
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          swiped_id: string
          is_like: boolean
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          swiped_id: string
          is_like: boolean
          created_at?: string
        }
        Update: {
          id?: string
          swiper_id?: string
          swiped_id?: string
          is_like?: boolean
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
          user1_last_read_message_id: string | null
          user2_last_read_message_id: string | null
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
          user1_last_read_message_id?: string | null
          user2_last_read_message_id?: string | null
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
          user1_last_read_message_id?: string | null
          user2_last_read_message_id?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          message_text: string | null
          message_type: string
          diamond_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          message_text?: string | null
          message_type?: string
          diamond_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          message_text?: string | null
          message_type?: string
          diamond_count?: number | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          amount: number
          transaction_type: string
          status: string
          created_at: string
          updated_at: string
          related_message_id: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          amount: number
          transaction_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          related_message_id?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          amount?: number
          transaction_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          related_message_id?: string | null
          error_message?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          match_id: string
          reason: string
          comment: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          match_id: string
          reason: string
          comment?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          match_id?: string
          reason?: string
          comment?: string | null
          status?: string
          created_at?: string
        }
      }
      premium_signups: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string
          created_at?: string
        }
      }
    }
    diamond_purchase_intents: {
      Row: {
        id: string
        user_id: string
        name: string
        email: string
        phone: string
        diamond_package_id: string
        amount_paid: number
        status: string
        created_at: string
      }
      Insert: {
        id?: string
        user_id: string
        name: string
        email: string
        phone: string
        diamond_package_id: string
        amount_paid: number
        status?: string
        created_at?: string
      }
      Update: {
        id?: string
        user_id?: string
        name?: string
        email?: string
        phone?: string
        diamond_package_id?: string
        amount_paid?: number
        status?: string
        created_at?: string
      }
    }
  }
}