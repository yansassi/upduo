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
          city: string
          current_rank: string
          favorite_heroes: string[]
          favorite_lines: string[]
          bio: string
          avatar_url: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          age: number
          city: string
          current_rank: string
          favorite_heroes: string[]
          favorite_lines: string[]
          bio?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          age?: number
          city?: string
          current_rank?: string
          favorite_heroes?: string[]
          favorite_lines?: string[]
          bio?: string
          avatar_url?: string | null
          updated_at?: string
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
    }
  }
}