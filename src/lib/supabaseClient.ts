import { createClient } from '@supabase/supabase-js'

// ====================================================================================
// --- ACTION REQUIRED: PASTE YOUR SUPABASE CREDENTIALS HERE ---
// ====================================================================================
// 1. Go to your Supabase project dashboard.
// 2. In the left sidebar, click "Project Settings" (the gear icon).
// 3. Click "API" in the settings list.
// 4. Under "Project API keys", you'll find your "Project URL" and your "anon public" key.
// 5. Copy the URL and paste it below, replacing 'YOUR_SUPABASE_URL_HERE'.
// 6. Copy the "anon public" key and paste it below, replacing 'YOUR_SUPABASE_ANON_KEY_HERE'.
// ====================================================================================

const supabaseUrl = 'https://zobecebtztlmikndlwpp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmVjZWJ0enRsbWlrbmRsd3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjMzNDcsImV4cCI6MjA3ODM5OTM0N30.AmnvpJlWlJpeKS1XONYpuC6Vp7ww7KmyJPOSxWQMfAI';

if (supabaseUrl.includes('YOUR_SUPABASE_URL_HERE') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY_HERE')) {
  console.error("***********************************************************************************")
  console.error("!!! SETUP REQUIRED !!!")
  console.error("You must update supabaseUrl and supabaseAnonKey in 'lib/supabaseClient.ts'")
  console.error("Please replace the placeholder strings with your actual Supabase credentials.")
  console.error("***********************************************************************************")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)