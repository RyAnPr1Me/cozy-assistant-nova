export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          created_at: string | null
          id: string
          learned_preferences: Json | null
          provider: string
          query: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          learned_preferences?: Json | null
          provider: string
          query: string
          response: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          learned_preferences?: Json | null
          provider?: string
          query?: string
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      AIUsage: {
        Row: {
          error: string | null
          feature: string
          id: string
          provider: string
          responseTimeMs: number | null
          success: boolean
          timestamp: string
          userId: string | null
        }
        Insert: {
          error?: string | null
          feature: string
          id: string
          provider: string
          responseTimeMs?: number | null
          success?: boolean
          timestamp?: string
          userId?: string | null
        }
        Update: {
          error?: string | null
          feature?: string
          id?: string
          provider?: string
          responseTimeMs?: number | null
          success?: boolean
          timestamp?: string
          userId?: string | null
        }
        Relationships: []
      }
      ChatMessage: {
        Row: {
          content: string
          createdAt: string
          id: string
          isRead: boolean
          receiverId: string | null
          senderId: string
        }
        Insert: {
          content: string
          createdAt?: string
          id: string
          isRead?: boolean
          receiverId?: string | null
          senderId: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: string
          isRead?: boolean
          receiverId?: string | null
          senderId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChatMessage_receiverId_fkey"
            columns: ["receiverId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChatMessage_senderId_fkey"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CompanyProfile: {
        Row: {
          address: string | null
          ceo: string | null
          changes: number | null
          city: string | null
          companyName: string
          country: string | null
          createdAt: string
          currency: string | null
          description: string
          employees: number | null
          exchange: string | null
          id: string
          image: string | null
          industry: string | null
          ipoDate: string | null
          isActivelyTrading: boolean | null
          marketCap: number | null
          phone: string | null
          price: number | null
          sector: string | null
          state: string | null
          symbol: string
          updatedAt: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          ceo?: string | null
          changes?: number | null
          city?: string | null
          companyName: string
          country?: string | null
          createdAt?: string
          currency?: string | null
          description: string
          employees?: number | null
          exchange?: string | null
          id: string
          image?: string | null
          industry?: string | null
          ipoDate?: string | null
          isActivelyTrading?: boolean | null
          marketCap?: number | null
          phone?: string | null
          price?: number | null
          sector?: string | null
          state?: string | null
          symbol: string
          updatedAt: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          ceo?: string | null
          changes?: number | null
          city?: string | null
          companyName?: string
          country?: string | null
          createdAt?: string
          currency?: string | null
          description?: string
          employees?: number | null
          exchange?: string | null
          id?: string
          image?: string | null
          industry?: string | null
          ipoDate?: string | null
          isActivelyTrading?: boolean | null
          marketCap?: number | null
          phone?: string | null
          price?: number | null
          sector?: string | null
          state?: string | null
          symbol?: string
          updatedAt?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      InsiderTrade: {
        Row: {
          createdAt: string
          filingDate: string | null
          id: string
          party: string | null
          position: string | null
          reportingName: string
          state: string | null
          symbol: string
          transactionDate: string
          transactionPrice: number | null
          transactionShares: number | null
          transactionType: string
          type: string
          url: string | null
          value: number | null
        }
        Insert: {
          createdAt?: string
          filingDate?: string | null
          id: string
          party?: string | null
          position?: string | null
          reportingName: string
          state?: string | null
          symbol: string
          transactionDate: string
          transactionPrice?: number | null
          transactionShares?: number | null
          transactionType: string
          type?: string
          url?: string | null
          value?: number | null
        }
        Update: {
          createdAt?: string
          filingDate?: string | null
          id?: string
          party?: string | null
          position?: string | null
          reportingName?: string
          state?: string | null
          symbol?: string
          transactionDate?: string
          transactionPrice?: number | null
          transactionShares?: number | null
          transactionType?: string
          type?: string
          url?: string | null
          value?: number | null
        }
        Relationships: []
      }
      RedditMention: {
        Row: {
          createdAt: string
          id: string
          memeScore: number | null
          memeStatus: string | null
          mentions: number
          sentiment: number
          symbol: string
        }
        Insert: {
          createdAt?: string
          id: string
          memeScore?: number | null
          memeStatus?: string | null
          mentions: number
          sentiment: number
          symbol: string
        }
        Update: {
          createdAt?: string
          id?: string
          memeScore?: number | null
          memeStatus?: string | null
          mentions?: number
          sentiment?: number
          symbol?: string
        }
        Relationships: []
      }
      RedditPost: {
        Row: {
          createdAt: string
          id: string
          mentionId: string
          subreddit: string | null
          title: string
          url: string
        }
        Insert: {
          createdAt?: string
          id: string
          mentionId: string
          subreddit?: string | null
          title: string
          url: string
        }
        Update: {
          createdAt?: string
          id?: string
          mentionId?: string
          subreddit?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "RedditPost_mentionId_fkey"
            columns: ["mentionId"]
            isOneToOne: false
            referencedRelation: "RedditMention"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          hasUnlimitedSearches: boolean
          id: string
          lastSearchReset: string
          searchCount: number
        }
        Insert: {
          createdAt?: string
          email: string
          hasUnlimitedSearches?: boolean
          id: string
          lastSearchReset?: string
          searchCount?: number
        }
        Update: {
          createdAt?: string
          email?: string
          hasUnlimitedSearches?: boolean
          id?: string
          lastSearchReset?: string
          searchCount?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          ai_provider: string | null
          created_at: string | null
          id: string
          location: string | null
          search_provider: string | null
          topics: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_provider?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          search_provider?: string | null
          topics?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_provider?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          search_provider?: string | null
          topics?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      UserPreference: {
        Row: {
          completedTutorials: Json | null
          createdAt: string
          dashboardType: string
          defaultView: string
          emailNotifications: Json | null
          id: string
          preferences: Json | null
          refreshInterval: number
          theme: string
          updatedAt: string
          userId: string
        }
        Insert: {
          completedTutorials?: Json | null
          createdAt?: string
          dashboardType?: string
          defaultView?: string
          emailNotifications?: Json | null
          id: string
          preferences?: Json | null
          refreshInterval?: number
          theme?: string
          updatedAt: string
          userId: string
        }
        Update: {
          completedTutorials?: Json | null
          createdAt?: string
          dashboardType?: string
          defaultView?: string
          emailNotifications?: Json | null
          id?: string
          preferences?: Json | null
          refreshInterval?: number
          theme?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserPreference_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      WatchlistItem: {
        Row: {
          addedAt: string
          alertOnChange: boolean
          alertThreshold: number | null
          companyName: string | null
          id: string
          notes: string | null
          priceAtAdd: number | null
          symbol: string
          userId: string
        }
        Insert: {
          addedAt?: string
          alertOnChange?: boolean
          alertThreshold?: number | null
          companyName?: string | null
          id: string
          notes?: string | null
          priceAtAdd?: number | null
          symbol: string
          userId: string
        }
        Update: {
          addedAt?: string
          alertOnChange?: boolean
          alertThreshold?: number | null
          companyName?: string | null
          id?: string
          notes?: string | null
          priceAtAdd?: number | null
          symbol?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "WatchlistItem_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      WeeklyFlyer: {
        Row: {
          analysis: string
          buyPrice: number | null
          change: number | null
          changePercent: number | null
          companyName: string
          id: string
          industry: string | null
          lastUpdated: string
          price: number
          sector: string | null
          sellPrice: number | null
          symbol: string
          volume: number | null
        }
        Insert: {
          analysis: string
          buyPrice?: number | null
          change?: number | null
          changePercent?: number | null
          companyName: string
          id: string
          industry?: string | null
          lastUpdated?: string
          price: number
          sector?: string | null
          sellPrice?: number | null
          symbol: string
          volume?: number | null
        }
        Update: {
          analysis?: string
          buyPrice?: number | null
          change?: number | null
          changePercent?: number | null
          companyName?: string
          id?: string
          industry?: string | null
          lastUpdated?: string
          price?: number
          sector?: string | null
          sellPrice?: number | null
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
