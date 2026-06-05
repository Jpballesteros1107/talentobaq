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
          phone: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: 'public' | 'institution' | 'admin';
          avatar_url?: string | null;
          phone?: string;
          email?: string;
        };
        Update: {
          full_name?: string;
          role?: 'public' | 'institution' | 'admin';
          avatar_url?: string | null;
          phone?: string;
          email?: string;
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
          latitude: number | null;
          longitude: number | null;
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
          latitude?: number | null;
          longitude?: number | null;
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
          latitude?: number | null;
          longitude?: number | null;
          updated_at?: string;
        };
      };
      institution_categories: {
        Row: { institution_id: string; category_id: string };
        Insert: { institution_id: string; category_id: string };
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
          modality: 'presencial' | 'virtual' | 'mixto';
          gender: 'masculino' | 'femenino' | 'mixto';
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
          modality?: 'presencial' | 'virtual' | 'mixto';
          gender?: 'masculino' | 'femenino' | 'mixto';
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
          modality?: 'presencial' | 'virtual' | 'mixto';
          gender?: 'masculino' | 'femenino' | 'mixto';
        };
      };
      schedules: {
        Row: {
          id: string;
          program_id: string;
          day: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          day: string;
          start_time: string;
          end_time: string;
        };
        Update: {
          day?: string;
          start_time?: string;
          end_time?: string;
        };
      };
      images: {
        Row: {
          id: string;
          institution_id: string;
          url: string;
          alt_text: string;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          url: string;
          alt_text?: string;
          sort_order?: number;
          is_cover?: boolean;
        };
        Update: {
          url?: string;
          alt_text?: string;
          sort_order?: number;
          is_cover?: boolean;
        };
      };
      social_media: {
        Row: {
          id: string;
          institution_id: string;
          platform: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          platform: string;
          url: string;
        };
        Update: {
          platform?: string;
          url?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          institution_id: string;
          program_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          institution_id: string;
          program_id?: string | null;
        };
        Update: never;
      };
      contact_requests: {
        Row: {
          id: string;
          institution_id: string;
          name: string;
          email: string;
          phone: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          name: string;
          email: string;
          phone?: string;
          message: string;
        };
        Update: never;
      };
      reviews: {
        Row: {
          id: string;
          institution_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          user_id: string;
          rating: number;
          comment?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
        };
      };
      events: {
        Row: {
          id: string;
          institution_id: string;
          title: string;
          description: string;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          location: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          title: string;
          description?: string;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string;
          image_url?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          event_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string;
          image_url?: string | null;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          image_url: string | null;
          category: string;
          author_id: string | null;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string;
          content?: string;
          image_url?: string | null;
          category?: string;
          author_id?: string | null;
          is_published?: boolean;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          image_url?: string | null;
          category?: string;
          is_published?: boolean;
          published_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Institution = Database['public']['Tables']['institutions']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type Image = Database['public']['Tables']['images']['Row'];
export type SocialMedia = Database['public']['Tables']['social_media']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type ContactRequest = Database['public']['Tables']['contact_requests']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
