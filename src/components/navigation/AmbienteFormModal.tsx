import React, { useState, useEffect } from 'react';
import { X, Home, Save } from 'lucide-react';
import { Ambiente, Local } from '../../types/inventory';
import { CameraCapture } from '../common/CameraCapture';

interface AmbienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ambiente: Omit<Ambiente, 'id'> & { id?: string }) => Promise<void>;
  locais: Local[];
  initialLocalId?: string;
  ambienteToEdit?: Ambiente | null;
}

export const AmbienteFormModal: React.FC<AmbienteFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  locais,
  initialLocalId,
  ambienteToEdit,
}) => {
  const [localId, setLocalId] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ambienteToEdit) {
      setLocalId(ambienteToEdit.local_id || '');
      setNome(ambienteToEdit.nome);
      setDescricao(ambienteToEdit.descricao || '');
      setFotoUrl(ambienteToEdit.foto_url || '');
    } else {
      setLocalId(initialLocalId || (locais.length > 0 ? locais[0].id : ''));
      setNome('');
      setDescricao('');
      setFotoUrl('');
    }
  }, [ambienteToEdit, initialLocalId, isOpen, locais]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o Nome do Ambiente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: ambienteToEdit?.id,
        local_id: localId || undefined,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        foto_url: fotoUrl || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar ambiente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {ambienteToEdit ? 'Editar Ambiente' : 'Novo Ambiente (Cômodo)'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Local / Imóvel Pertencente *
            </label>
            <select
              required
              value={localId}
              onChange={e => setLocalId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            >
              <option value="" disabled>Selecione um local...</option>
              {locais.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Ambiente *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Escritório, Garagem, Cozinha, Quarto Principal"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descrição do Cômodo
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Breve resumo da finalidade do cômodo..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <CameraCapture
            value={fotoUrl}
            onChange={setFotoUrl}
            label="Foto do Ambiente"
          />

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Ambiente'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
