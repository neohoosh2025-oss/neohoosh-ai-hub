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
      article_translations: {
        Row: {
          article_id: string
          content: string
          created_at: string
          excerpt: string
          id: string
          language: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          language: string
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          approved: boolean
          created_at: string
          email: string
          id: string
          message: string
          name: string
          replied_at: string | null
          reply: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          replied_at?: string | null
          reply?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          replied_at?: string | null
          reply?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          model_type: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_type: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          model_type?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      homepage_features: {
        Row: {
          color: string | null
          created_at: string
          description: string
          display_order: number | null
          features_list: Json | null
          gradient: string | null
          icon_name: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description: string
          display_order?: number | null
          features_list?: Json | null
          gradient?: string | null
          icon_name: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string
          display_order?: number | null
          features_list?: Json | null
          gradient?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_stats: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          stat_key: string
          stat_label: string
          stat_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          stat_key: string
          stat_label: string
          stat_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          stat_key?: string
          stat_label?: string
          stat_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_tools: {
        Row: {
          color: string | null
          created_at: string
          display_order: number | null
          icon_name: string
          id: string
          is_active: boolean
          link_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon_name: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon_name?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          image_url: string | null
          reasoning_details: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          reasoning_details?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          reasoning_details?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_chat_members: {
        Row: {
          chat_id: string
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neohi_chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "neohi_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_chats: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_message_at: string | null
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neohi_chats_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_contacts: {
        Row: {
          added_at: string | null
          contact_name: string | null
          contact_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          contact_name?: string | null
          contact_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          contact_name?: string | null
          contact_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neohi_contacts_contact_user_id_fkey"
            columns: ["contact_user_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_message_status: {
        Row: {
          id: string
          message_id: string
          status: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          status: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          status?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neohi_message_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "neohi_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_message_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          media_url: string | null
          message_type: string | null
          reply_to: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          media_url?: string | null
          message_type?: string | null
          reply_to?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          media_url?: string | null
          message_type?: string | null
          reply_to?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neohi_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "neohi_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "neohi_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type: string
          media_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neohi_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neohi_story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "neohi_stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_typing_indicators: {
        Row: {
          chat_id: string
          id: string
          is_typing: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neohi_typing_indicators_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "neohi_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neohi_typing_indicators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neohi_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neohi_users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          phone: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          phone?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          author_id: string
          created_at: string
          description: string
          file_url: string | null
          id: string
          pages: string
          price: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description: string
          file_url?: string | null
          id?: string
          pages: string
          price: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          pages?: string
          price?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_articles: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved: boolean
          avatar_url: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          name: string
          rating: number
          role: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          avatar_url?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          rating?: number
          role: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          avatar_url?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          rating?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          created_at: string
          id: string
          key: string
          memory_type: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          memory_type: string
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          memory_type?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_chat_member: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
