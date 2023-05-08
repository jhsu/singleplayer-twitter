export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      personas: {
        Row: {
          created_at: string | null
          id: number
          personality: Json | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          personality?: Json | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          personality?: Json | null
          username?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
        }
        Insert: {
          id: string
          username: string
        }
        Update: {
          id?: string
          username?: string
        }
      }
      timeline: {
        Row: {
          content: string
          created_at: string | null
          id: string
          persona_id: number | null
          reply_to_id: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          persona_id?: number | null
          reply_to_id?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          persona_id?: number | null
          reply_to_id?: string | null
          user_id?: string | null
          username?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_timeline_entries: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          username: string
          content: string
          created_at: string
        }[]
      }
      get_tweet_tree: {
        Args: {
          tweet_id: string
        }
        Returns: {
          id: string
          reply_to_id: string
          username: string
          content: string
          created_at: string
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
