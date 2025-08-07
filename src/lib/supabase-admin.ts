
import { createClient } from '@supabase/supabase-js';

// Ensure the environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is not defined. Please check your .env.local file.");
}
if (!supabaseServiceRoleKey) {
  throw new Error("Supabase Service Role Key is not defined. Please check your .env.local file.");
}

// Create and export the Supabase admin client
// This client has elevated privileges and should only be used on the server.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
