import { supabase } from './supabase-client';
import { News } from './types';

/**
 * Funciones de datos específicas para el cliente
 * Estas funciones solo usan supabase-client y no tienen dependencias del servidor
 */

export async function getNewsBySlugClient(slug: string): Promise<News | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data as News | null;
}

export async function getNewsClient(): Promise<News[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .limit(12);
    
  if (error) throw new Error(error.message);
  return (data as News[]) || [];
}