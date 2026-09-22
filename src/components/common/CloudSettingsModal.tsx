import React, { useState } from 'react';
import { X, Cloud, Key, Check, Info } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '../../services/supabase';

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsSaved: () => void;
}

export const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsSaved,
}) => {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, key);
    alert('Configurações de Nuvem salvas com sucesso!');
    onCredentialsSaved();
    onClose();
  };

  const handleDisconnect = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    alert('Desconectado do Supabase. O aplicativo agora utilizará o armazenamento local.');
    onCredentialsSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurações de Nuvem (Supabase)</h2>
              <p className="text-xs text-slate-500">Sincronização em nuvem e armazenamento remoto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              Sem credenciais, o aplicativo roda 100% offline em LocalStorage com dados salvos no seu navegador. Insira a URL e a Chave Anon do seu projeto Supabase para sincronização PostgreSQL.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" /> Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> Supabase Anon Key
            </label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {current.url ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Desconectar Nuvem
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Credenciais</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
