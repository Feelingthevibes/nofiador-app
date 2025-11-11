import { User as SupabaseUser } from '@supabase/supabase-js';

export type Language = 'en' | 'es';
export type Role = 'renter' | 'landlord' | 'admin';
export type AuthModal = 'login' | 'signup' | null;

export interface UserProfile {
  id: string; // UUID from auth.users
  role: Role;
  saved_properties: number[];
  preferred_language: Language;
  contact_name: string | null;
  contact_phone: string | null;
  email?: string; // For admin view
}

export type User = SupabaseUser & {
  profile: UserProfile | null;
};

export interface Property {
  id: number;
  landlord_id: string; 
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  price: number;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area: number; 
  images: string[];
  slug: string;
  video_url?: string;
  profiles: {
    contact_name: string | null;
    contact_phone: string | null;
  } | null;
}

export type NewPropertyData = Omit<Property, 'id' | 'landlord_id' | 'slug' | 'profiles'>;

export interface Conversation {
  id: number;
  participant_one_id: string;
  participant_two_id: string;
  created_at: string;
  // This is not a real DB column, but we'll join it for the UI
  other_participant_name?: string; 
  other_participant_id?: string;
  last_message_content?: string;
  last_message_time?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
