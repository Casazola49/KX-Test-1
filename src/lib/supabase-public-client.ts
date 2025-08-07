
import { createClient } from '@supabase/supabase-js';

// This client is specifically for public pages that do not require an authenticated user.
// It uses the publicly available URL and the anonymous key.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or anonymous key is not defined.');
}

export const supabasePublicClient = createClient(supabaseUrl, supabaseAnonKey);
