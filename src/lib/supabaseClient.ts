// FIX: Add a triple-slash directive to make TypeScript aware of Vite's `import.meta.env`.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

// Correctly use environment variables for Supabase credentials.
// This is the standard, secure way to handle secrets in a production environment like Vercel.
// You MUST set these variables in your Vercel project settings.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Make sure you have set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project's Environment Variables."
  console.error("***********************************************************************************")
  console.error("!!! SETUP REQUIRED !!!")
  console.error(errorMessage)
  console.error("***********************************************************************************")
  // Throw an error to make it obvious during development or in build logs.
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)