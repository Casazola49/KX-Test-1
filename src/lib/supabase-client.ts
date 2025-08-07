import { createClient } from '@supabase/supabase-js';

// NOTA: Estas variables de entorno son seguras para usar en el cliente,
// ya que utilizan la clave anónima (anon key) de Supabase, que está diseñada
// para ser pública.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required and must be defined in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
