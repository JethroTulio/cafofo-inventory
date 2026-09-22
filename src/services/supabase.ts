import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY_URL = 'home_inventory_supabase_url';
const LOCAL_STORAGE_KEY_KEY = 'home_inventory_supabase_key';

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim();
  // Remover sufixos como /rest/v1/, /rest/v1, /rest ou barras no final
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/rest\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

export function getSupabaseCredentials() {
  const rawUrl = localStorage.getItem(LOCAL_STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(LOCAL_STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const url = sanitizeSupabaseUrl(rawUrl);
  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string) {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = key.trim();
  if (cleanUrl && cleanKey) {
    localStorage.setItem(LOCAL_STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(LOCAL_STORAGE_KEY_KEY, cleanKey);
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
