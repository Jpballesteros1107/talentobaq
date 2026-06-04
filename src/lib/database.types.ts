export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'public' | 'institution' | 'admin';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: 'public' | 'institution' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          role?: 'public' | 'institution' | 'admin';
          avatar_url?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: 'sport' | 'culture';
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: 'sport' | 'culture';
          icon?: string;
          color?: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          type?: 'sport' | 'culture';
          icon?: string;
          color?: string;
          sort_order?: number;
        };
      };
      institutions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          address: string;
          neighborhood: string;
          phone: string;
          email: string;
          website: string;
          logo_url: string | null;
          cover_url: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          address?: string;
          neighborhood?: string;
          phone?: string;
          email?: string;
          website?: string;
          logo_url?: string | null;
          cover_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          verified?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          address?: string;
          neighborhood?: string;
          phone?: string;
          email?: string;
          website?: string;
          logo_url?: string | null;
          cover_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          verified?: boolean;
          updated_at?: string;
        };
      };
      institution_categories: {
        Row: {
          institution_id: string;
          category_id: string;
        };
        Insert: {
          institution_id: string;
          category_id: string;
        };
        Update: never;
      };
      programs: {
        Row: {
          id: string;
          institution_id: string;
          category_id: string | null;
          name: string;
          description: string;
          schedule: string;
          price: number;
          age_min: number;
          age_max: number;
          spots_available: number | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          category_id?: string | null;
          name: string;
          description?: string;
          schedule?: string;
          price?: number;
          age_min?: number;
          age_max?: number;
          spots_available?: number | null;
          image_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          description?: string;
          schedule?: string;
          price?: number;
          age_min?: number;
          age_max?: number;
          spots_available?: number | null;
          image_url?: string | null;
          is_active?: boolean;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Institution = Database['public']['Tables']['institutions']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];

export type InstitutionWithCategories = Institution & {
  institution_categories: Array<{ category_id: string; categories: Category }>;
  programs: Program[];
};
