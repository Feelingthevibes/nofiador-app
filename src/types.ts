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
}

// FIX: Changed interface extending a type to a type alias for better compatibility.
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
  profiles: {
    contact_name: string | null;
    contact_phone: string | null;
  } | null;
}

export type NewPropertyData = Omit<Property, 'id' | 'landlord_id' | 'slug' | 'profiles'>;