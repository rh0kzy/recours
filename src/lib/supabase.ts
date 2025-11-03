import { createClient } from '@supabase/supabase-js'

// Use NEXT_PUBLIC_ prefix for client-side access or regular env vars for server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Defensive initialization - provide clear error message if vars are missing
if (!supabaseUrl) {
  throw new Error(
    'Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in your environment variables.'
  );
}

if (!supabaseKey) {
  throw new Error(
    'Missing Supabase Key. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in your environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey)