export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          vibe_profile: Json
          home_city: string | null
          total_trips: number
          total_clones: number
          follower_count: number
          following_count: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          vibe_profile?: Json
          home_city?: string | null
          total_trips?: number
          total_clones?: number
          follower_count?: number
          following_count?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          vibe_profile?: Json
          home_city?: string | null
          total_trips?: number
          total_clones?: number
          follower_count?: number
          following_count?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          country_code: string | null
          cover_emoji: string
          cover_image: string | null
          itinerary: Json
          days: number
          budget_usd: number | null
          actual_cost: number | null
          currency: string
          tags: string[]
          personas: string[]
          is_public: boolean
          is_draft: boolean
          clone_count: number
          like_count: number
          view_count: number
          ai_summary: string | null
          ai_tips: string[] | null
          best_season: string | null
          parent_trip_id: string | null
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          country_code?: string | null
          cover_emoji?: string
          cover_image?: string | null
          itinerary?: Json
          days?: number
          budget_usd?: number | null
          actual_cost?: number | null
          currency?: string
          tags?: string[]
          personas?: string[]
          is_public?: boolean
          is_draft?: boolean
          clone_count?: number
          like_count?: number
          view_count?: number
          ai_summary?: string | null
          ai_tips?: string[] | null
          best_season?: string | null
          parent_trip_id?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          country_code?: string | null
          cover_emoji?: string
          cover_image?: string | null
          itinerary?: Json
          days?: number
          budget_usd?: number | null
          actual_cost?: number | null
          currency?: string
          tags?: string[]
          personas?: string[]
          is_public?: boolean
          is_draft?: boolean
          clone_count?: number
          like_count?: number
          view_count?: number
          ai_summary?: string | null
          ai_tips?: string[] | null
          best_season?: string | null
          parent_trip_id?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          messages: Json
          persona: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          messages?: Json
          persona?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          messages?: Json
          persona?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          type: string
          content: string | null
          caption: string | null
          location_name: string | null
          latitude: number | null
          longitude: number | null
          ai_caption: string | null
          is_highlight: boolean
          is_public: boolean
          taken_at: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          type?: string
          content?: string | null
          caption?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          ai_caption?: string | null
          is_highlight?: boolean
          is_public?: boolean
          taken_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          type?: string
          content?: string | null
          caption?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          ai_caption?: string | null
          is_highlight?: boolean
          is_public?: boolean
          taken_at?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
