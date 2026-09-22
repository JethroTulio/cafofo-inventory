import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { Local } from '../../types/inventory';
import { CameraCapture } from '../common/CameraCapture';

interface LocalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (local: Omit<Local, 'id'> & { id?: string }) => Promise<void>;
  localToEdit?: Local | null;
}

export const LocalFormModal: React.FC<LocalFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  localToEdit,
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (localToEdit) {
      setNome(localToEdit.nome);
      setDescricao(localToEdit.descricao || '');
      setFotoUrl(localToEdit.foto_url || '');
    } else {
      setNome('');
      setDescricao('');
      setFotoUrl('');
    }
  }, [localToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o Nome do Local (ex: Apartamento, Casa da Mãe, Trabalho).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: localToEdit?.id,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        foto_url: fotoUrl || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar local.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {localToEdit ? 'Editar Local' : 'Novo Local / Imóvel (Nível 0)'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Local / Propriedade *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Apartamento, Trabalho, Casa da Mãe, Casa de Praia"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descrição do Local
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Endereço, finalidade ou observações do imóvel..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <CameraCapture
            value={fotoUrl}
            onChange={setFotoUrl}
            label="Foto da Fachada / Local"
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Local'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
