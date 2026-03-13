export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          message: string
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_published: boolean
          metadata: Json | null
          section: Database["public"]["Enums"]["content_section"]
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          metadata?: Json | null
          section: Database["public"]["Enums"]["content_section"]
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          metadata?: Json | null
          section?: Database["public"]["Enums"]["content_section"]
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          event_date: string
          id: string
          image_url: string | null
          location: string | null
          luma_url: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          location?: string | null
          luma_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string | null
          luma_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          is_active: boolean
          is_featured: boolean
          role_title: string | null
          skill_tags: string[]
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          role_title?: string | null
          skill_tags?: string[]
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          role_title?: string | null
          skill_tags?: string[]
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      record_failed_attempt: {
        Args: {
          p_identifier: string
          p_action: string
        }
        Returns: null
      }
      cleanup_rate_limits: {
        Args: Record<string, never>
        Returns: null
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_action: string
          p_max_attempts?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      content_section:
        | "hero"
        | "mission"
        | "stats"
        | "events_section"
        | "members_spotlight"
        | "partners_ecosystem"
        | "community_wall"
        | "faq"
        | "join_cta"
        | "footer"
      event_status: "draft" | "published" | "cancelled" | "completed"
      user_role: "super_admin" | "admin" | "editor"
    }
    CompositeTypes: Record<string, never>
  }
}

export {}
