import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY_URL = 'home_inventory_supabase_url';
const LOCAL_STORAGE_KEY_KEY = 'home_inventory_supabase_key';

export function getSupabaseCredentials() {
  const url = localStorage.getItem(LOCAL_STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(LOCAL_STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    localStorage.setItem(LOCAL_STORAGE_KEY_URL, url.trim());
    localStorage.setItem(LOCAL_STORAGE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY_URL);
    localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
  }
}

export function initSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }
  return null;
}
