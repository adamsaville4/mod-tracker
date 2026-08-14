export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      mod_fitment: {
        Row: {
          mod_id: string
          vehicle_model_id: string
          verified: boolean
        }
        Insert: {
          mod_id: string
          vehicle_model_id: string
          verified?: boolean
        }
        Update: {
          mod_id?: string
          vehicle_model_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "mod_fitment_mod_id_fkey"
            columns: ["mod_id"]
            isOneToOne: false
            referencedRelation: "mods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_fitment_vehicle_model_id_fkey"
            columns: ["vehicle_model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_links: {
        Row: {
          created_at: string | null
          id: string
          is_affiliate: boolean
          mod_id: string
          retailer: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_affiliate?: boolean
          mod_id: string
          retailer: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_affiliate?: boolean
          mod_id?: string
          retailer?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_links_mod_id_fkey"
            columns: ["mod_id"]
            isOneToOne: false
            referencedRelation: "mods"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_requests: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          requested_by: string
          status: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          requested_by: string
          status?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          requested_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mod_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mods: {
        Row: {
          brand: string | null
          category_id: string
          created_at: string | null
          id: string
          name: string
          slug: string
          typical_cost_high: number | null
          typical_cost_low: number | null
        }
        Insert: {
          brand?: string | null
          category_id: string
          created_at?: string | null
          id?: string
          name: string
          slug: string
          typical_cost_high?: number | null
          typical_cost_low?: number | null
        }
        Update: {
          brand?: string | null
          category_id?: string
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          typical_cost_high?: number | null
          typical_cost_low?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mods_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mod_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          username: string
          username_chosen: boolean
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          username: string
          username_chosen?: boolean
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          username?: string
          username_chosen?: boolean
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string | null
          id: string
          mod_id: string
          review: string | null
          score: number
          user_id: string
          vehicle_mod_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mod_id: string
          review?: string | null
          score: number
          user_id: string
          vehicle_mod_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mod_id?: string
          review?: string | null
          score?: number
          user_id?: string
          vehicle_mod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_vehicle_mod_id_mod_id_fkey"
            columns: ["vehicle_mod_id", "mod_id"]
            isOneToOne: false
            referencedRelation: "vehicle_mods"
            referencedColumns: ["id", "mod_id"]
          },
        ]
      }
      vehicle_models: {
        Row: {
          created_at: string | null
          generation: string | null
          id: string
          make: string
          model: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          generation?: string | null
          id?: string
          make: string
          model: string
          slug: string
        }
        Update: {
          created_at?: string | null
          generation?: string | null
          id?: string
          make?: string
          model?: string
          slug?: string
        }
        Relationships: []
      }
      vehicle_mods: {
        Row: {
          cost_paid: number | null
          created_at: string | null
          date_fitted: string | null
          date_removed: string | null
          id: string
          install_hours: number | null
          mod_id: string
          notes: string | null
          vehicle_id: string
        }
        Insert: {
          cost_paid?: number | null
          created_at?: string | null
          date_fitted?: string | null
          date_removed?: string | null
          id?: string
          install_hours?: number | null
          mod_id: string
          notes?: string | null
          vehicle_id: string
        }
        Update: {
          cost_paid?: number | null
          created_at?: string | null
          date_fitted?: string | null
          date_removed?: string | null
          id?: string
          install_hours?: number | null
          mod_id?: string
          notes?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_mods_mod_id_fkey"
            columns: ["mod_id"]
            isOneToOne: false
            referencedRelation: "mods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_mods_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string | null
          id: string
          instagram_handle: string | null
          model_id: string
          nickname: string | null
          owner_id: string
          slug: string
          tiktok_handle: string | null
          updated_at: string | null
          x_handle: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          model_id: string
          nickname?: string | null
          owner_id: string
          slug: string
          tiktok_handle?: string | null
          updated_at?: string | null
          x_handle?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          model_id?: string
          nickname?: string | null
          owner_id?: string
          slug?: string
          tiktok_handle?: string | null
          updated_at?: string | null
          x_handle?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mod_rating_summary: {
        Row: {
          avg_score: number | null
          mod_id: string | null
          rating_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
