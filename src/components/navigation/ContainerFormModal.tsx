import React, { useState, useEffect } from 'react';
import { X, Box, Save } from 'lucide-react';
import { Container, Ambiente } from '../../types/inventory';
import { CameraCapture } from '../common/CameraCapture';

interface ContainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (container: Omit<Container, 'id'> & { id?: string }) => Promise<void>;
  ambientes: Ambiente[];
  initialAmbienteId?: string;
  containerToEdit?: Container | null;
}

export const ContainerFormModal: React.FC<ContainerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ambientes,
  initialAmbienteId,
  containerToEdit,
}) => {
  const [ambienteId, setAmbienteId] = useState('');
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (containerToEdit) {
      setAmbienteId(containerToEdit.ambiente_id);
      setNome(containerToEdit.nome);
      setFotoUrl(containerToEdit.foto_url || '');
    } else {
      setAmbienteId(initialAmbienteId || (ambientes.length > 0 ? ambientes[0].id : ''));
      setNome('');
      setFotoUrl('');
    }
  }, [containerToEdit, initialAmbienteId, isOpen, ambientes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !ambienteId) {
      alert('Por favor, informe o Nome do Container e selecione o Ambiente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: containerToEdit?.id,
        ambiente_id: ambienteId,
        nome: nome.trim(),
        foto_url: fotoUrl || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar container.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Box className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {containerToEdit ? 'Editar Container' : 'Novo Container / Móvel'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ambiente Pertencente *
            </label>
            <select
              required
              value={ambienteId}
              onChange={e => setAmbienteId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            >
              <option value="" disabled>Selecione um ambiente...</option>
              {ambientes.map(amb => (
                <option key={amb.id} value={amb.id}>{amb.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Container / Organizador *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Gaveteiro Principal, Armário de Ferramentas, Caixa Plástica"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            />
          </div>

          <CameraCapture
            value={fotoUrl}
            onChange={setFotoUrl}
            label="Foto do Container"
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Container'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
