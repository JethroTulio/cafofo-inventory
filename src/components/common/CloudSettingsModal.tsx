import React, { useState } from 'react';
import { X, Cloud, Key, Check, Info, RefreshCw, UploadCloud } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '../../services/supabase';
import { db } from '../../services/db';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSyncData = async () => {
    if (!url || !key) {
      alert('Preencha a URL e a Anon Key do Supabase antes de sincronizar.');
      return;
    }

    saveSupabaseCredentials(url, key);
    setIsSyncing(true);
    setSyncStatus('Sincronizando locais, ambientes, containers, itens e fotos com o Supabase...');
    setSyncSuccess(null);

    const result = await db.syncAllLocalToCloud();
    setIsSyncing(false);

    if (result.success) {
      setSyncSuccess(true);
      const counts = result.counts;
      setSyncStatus(`Sucesso! ${counts?.itens || 0} itens (com fotos), ${counts?.containers || 0} containers, ${counts?.ambientes || 0} ambientes e ${counts?.locais || 0} locais foram salvos no Supabase.`);
      onCredentialsSaved();
    } else {
      setSyncSuccess(false);
      setSyncStatus(`Falha na sincronização: ${result.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      saveSupabaseCredentials('', '');
      onCredentialsSaved();
      onClose();
      return;
    }

    saveSupabaseCredentials(url, key);
    await handleSyncData();
  };

  const handleDisconnect = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    setSyncStatus(null);
    setSyncSuccess(null);
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
              Insira a URL e a Anon Key do Supabase para conectar seu banco de dados na nuvem. Todos os seus itens e fotos salvos localmente serão sincronizados automaticamente!
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-blue-600" /> Supabase Project URL
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
              <Key className="w-3.5 h-3.5 text-amber-600" /> Supabase Anon Key
            </label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          {/* Status Feedback */}
          {syncStatus && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              syncSuccess === true
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : syncSuccess === false
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800 animate-pulse'
            }`}>
              {syncStatus}
            </div>
          )}

          {/* Botão de Ação Manual de Sincronização */}
          {url && key && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncData}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <UploadCloud className="w-4 h-4 text-emerald-600" />
              )}
              <span>{isSyncing ? 'Sincronizando...' : '⚡ Sincronizar Arquivos e Dados Locais Agora'}</span>
            </button>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {current.url ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs font-semibold text-rose-600 hover:underline"
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
                disabled={isSyncing}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Salvar & Sincronizar</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
