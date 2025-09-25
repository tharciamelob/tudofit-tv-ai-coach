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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          conversation_type: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_type: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_categories: {
        Row: {
          slug: string
          title: string
        }
        Insert: {
          slug: string
          title: string
        }
        Update: {
          slug?: string
          title?: string
        }
        Relationships: []
      }
      category_rules: {
        Row: {
          category_slug: string
          require_equipment: string[] | null
          require_level: string[] | null
          require_modality: string[] | null
          require_tags: Json | null
          rule_id: number
        }
        Insert: {
          category_slug: string
          require_equipment?: string[] | null
          require_level?: string[] | null
          require_modality?: string[] | null
          require_tags?: Json | null
          rule_id?: number
        }
        Update: {
          category_slug?: string
          require_equipment?: string[] | null
          require_level?: string[] | null
          require_modality?: string[] | null
          require_tags?: Json | null
          rule_id?: number
        }
        Relationships: []
      }
      exercise_tags: {
        Row: {
          exercise_slug: string
          tag_key: string
          tag_value: string
        }
        Insert: {
          exercise_slug: string
          tag_key: string
          tag_value: string
        }
        Update: {
          exercise_slug?: string
          tag_key?: string
          tag_value?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          difficulty: string | null
          duration_seconds: number | null
          equipment: string | null
          id: string
          muscle_group: string | null
          name: string
          preview_path: string | null
          slug: string
          tags: string[] | null
          video_path: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          muscle_group?: string | null
          name: string
          preview_path?: string | null
          slug: string
          tags?: string[] | null
          video_path?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          muscle_group?: string | null
          name?: string
          preview_path?: string | null
          slug?: string
          tags?: string[] | null
          video_path?: string | null
        }
        Relationships: []
      }
      food_diary: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          date: string
          fat: number | null
          food_name: string
          id: string
          item_name: string | null
          meal_type: string
          photo_url: string | null
          protein: number | null
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          food_name: string
          id?: string
          item_name?: string | null
          meal_type: string
          photo_url?: string | null
          protein?: number | null
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          food_name?: string
          id?: string
          item_name?: string | null
          meal_type?: string
          photo_url?: string | null
          protein?: number | null
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean | null
          plan_data: Json
          plan_name: string
          plan_type: string | null
          questionnaire_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          plan_data: Json
          plan_name: string
          plan_type?: string | null
          questionnaire_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          plan_data?: Json
          plan_name?: string
          plan_type?: string | null
          questionnaire_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "nutrition_questionnaire"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_questionnaire: {
        Row: {
          allergies: string[] | null
          created_at: string
          food_preferences: string[] | null
          food_restrictions: string[] | null
          id: string
          meals_per_day: number | null
          nutrition_goal: string
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string
          food_preferences?: string[] | null
          food_restrictions?: string[] | null
          id?: string
          meals_per_day?: number | null
          nutrition_goal: string
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          created_at?: string
          food_preferences?: string[] | null
          food_restrictions?: string[] | null
          id?: string
          meals_per_day?: number | null
          nutrition_goal?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_questionnaire: {
        Row: {
          available_equipment: string[] | null
          available_time: number
          created_at: string
          fitness_goal: string
          fitness_level: string | null
          id: string
          physical_restrictions: string | null
          user_id: string
          weekly_frequency: number
        }
        Insert: {
          available_equipment?: string[] | null
          available_time: number
          created_at?: string
          fitness_goal: string
          fitness_level?: string | null
          id?: string
          physical_restrictions?: string | null
          user_id: string
          weekly_frequency: number
        }
        Update: {
          available_equipment?: string[] | null
          available_time?: number
          created_at?: string
          fitness_goal?: string
          fitness_level?: string | null
          id?: string
          physical_restrictions?: string | null
          user_id?: string
          weekly_frequency?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          fitness_goal: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          sleep_goal: number | null
          subscription_expires_at: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          sleep_goal?: number | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          sleep_goal?: number | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      sleep_tracking: {
        Row: {
          bedtime: string
          created_at: string
          date: string
          id: string
          sleep_duration: unknown | null
          sleep_quality: number | null
          user_id: string
          wake_time: string
        }
        Insert: {
          bedtime: string
          created_at?: string
          date?: string
          id?: string
          sleep_duration?: unknown | null
          sleep_quality?: number | null
          user_id: string
          wake_time: string
        }
        Update: {
          bedtime?: string
          created_at?: string
          date?: string
          id?: string
          sleep_duration?: unknown | null
          sleep_quality?: number | null
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      walk_sessions: {
        Row: {
          average_pace: number | null
          calories_burned: number | null
          created_at: string
          distance_meters: number | null
          end_time: string | null
          id: string
          is_completed: boolean | null
          route_data: Json | null
          start_time: string
          steps: number | null
          user_id: string
        }
        Insert: {
          average_pace?: number | null
          calories_burned?: number | null
          created_at?: string
          distance_meters?: number | null
          end_time?: string | null
          id?: string
          is_completed?: boolean | null
          route_data?: Json | null
          start_time: string
          steps?: number | null
          user_id: string
        }
        Update: {
          average_pace?: number | null
          calories_burned?: number | null
          created_at?: string
          distance_meters?: number | null
          end_time?: string | null
          id?: string
          is_completed?: boolean | null
          route_data?: Json | null
          start_time?: string
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      walking_sessions: {
        Row: {
          average_pace_min_per_km: number
          calories_burned: number
          created_at: string
          distance_km: number
          duration_seconds: number
          end_time: string | null
          id: string
          route_data: Json | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_pace_min_per_km?: number
          calories_burned?: number
          created_at?: string
          distance_km?: number
          duration_seconds?: number
          end_time?: string | null
          id?: string
          route_data?: Json | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_pace_min_per_km?: number
          calories_burned?: number
          created_at?: string
          distance_km?: number
          duration_seconds?: number
          end_time?: string | null
          id?: string
          route_data?: Json | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_tracking: {
        Row: {
          amount_ml: number
          created_at: string
          daily_goal_ml: number | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          daily_goal_ml?: number | null
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          daily_goal_ml?: number | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean | null
          plan_data: Json
          plan_name: string
          questionnaire_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          plan_data: Json
          plan_name: string
          questionnaire_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          plan_data?: Json
          plan_name?: string
          questionnaire_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "personal_questionnaire"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      é_usuário_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_email?: string }
        Returns: boolean
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
  public: {
    Enums: {},
  },
} as const
