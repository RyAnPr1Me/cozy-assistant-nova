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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
