export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          price: number;
          status: 'active' | 'sold' | 'expired';
          image_url: string | null;
          location: string;
          views: number;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          price: number;
          status?: 'active' | 'sold' | 'expired';
          image_url?: string | null;
          location: string;
          views?: number;
          is_featured?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          price?: number;
          status?: 'active' | 'sold' | 'expired';
          image_url?: string | null;
          location?: string;
          views?: number;
          is_featured?: boolean;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          city: string | null;
          country: string;
          bio: string | null;
          rating: number;
          is_verified: boolean;
          listings_count: number;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          country?: string;
          bio?: string | null;
          rating?: number;
          is_verified?: boolean;
          listings_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          country?: string;
          bio?: string | null;
          rating?: number;
          is_verified?: boolean;
          listings_count?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          transaction_id: string;
          reference: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: 'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'stripe';
          user_id: string | null;
          listing_id: string | null;
          metadata: Record<string, any> | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          transaction_id: string;
          reference: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: 'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'stripe';
          user_id?: string | null;
          listing_id?: string | null;
          metadata?: Record<string, any> | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          transaction_id?: string;
          reference?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: 'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'stripe';
          user_id?: string | null;
          listing_id?: string | null;
          metadata?: Record<string, any> | null;
          error_message?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
