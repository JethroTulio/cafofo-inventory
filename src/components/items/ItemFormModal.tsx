import React, { useState, useEffect } from 'react';
import { X, Plus, Save, RotateCcw, Package, Tag as TagIcon } from 'lucide-react';
import { Item, Container, Categoria, Tag, ItemWithDetails } from '../../types/inventory';
import { CameraCapture } from '../common/CameraCapture';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<Item, 'id'> & { id?: string }, addAnother?: boolean) => Promise<void>;
  containers: Container[];
  categorias: Categoria[];
  tags: Tag[];
  initialContainerId?: string;
  itemToEdit?: ItemWithDetails | null;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  containers,
  categorias,
  tags,
  initialContainerId,
  itemToEdit,
}) => {
  const [containerId, setContainerId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [nome, setNome] = useState('');
  const [subLocalizacao, setSubLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number | string>(0);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [dataValidade, setDataValidade] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setContainerId(itemToEdit.container_id);
      setCategoriaId(itemToEdit.categoria_id || '');
      setNome(itemToEdit.nome);
      setSubLocalizacao(itemToEdit.sub_localizacao || '');
      setDescricao(itemToEdit.descricao || '');
      setPreco(itemToEdit.preco || 0);
      setQuantidade(itemToEdit.quantidade || 1);
      setDataValidade(itemToEdit.data_validade || '');
      setFotoUrl(itemToEdit.foto_url || '');
      setSelectedTagIds(itemToEdit.tag_ids || []);
    } else {
      setContainerId(initialContainerId || (containers.length > 0 ? containers[0].id : ''));
      setCategoriaId(categorias.length > 0 ? categorias[0].id : '');
      setNome('');
      setSubLocalizacao('');
      setDescricao('');
      setPreco(0);
      setQuantidade(1);
      setDataValidade('');
      setFotoUrl('');
      setSelectedTagIds([]);
    }
  }, [itemToEdit, initialContainerId, isOpen, containers, categorias]);

  if (!isOpen) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!nome.trim() || !containerId) {
      alert('Por favor, informe o Nome do Item e selecione um Container.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          id: itemToEdit?.id,
          container_id: containerId,
          categoria_id: categoriaId || undefined,
          nome: nome.trim(),
          sub_localizacao: subLocalizacao.trim() || undefined,
          descricao: descricao.trim() || undefined,
          preco: Number(preco) || 0,
          quantidade: Number(quantidade) || 1,
          data_validade: dataValidade || undefined,
          foto_url: fotoUrl || undefined,
          tag_ids: selectedTagIds,
        },
        addAnother
      );

      if (addAnother) {
        // Limpar campos de formulário mantendo Container e Categoria selecionados
        setNome('');
        setSubLocalizacao('');
        setDescricao('');
        setPreco(0);
        setQuantidade(1);
        setDataValidade('');
        setFotoUrl('');
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">

        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {itemToEdit ? 'Editar Item' : 'Cadastrar Novo Item'}
              </h2>
              <p className="text-xs text-slate-500">Preencha os detalhes e a localização do objeto</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={e => handleSubmit(e, false)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Nome do Item */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Item *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Alicate Universal, Cabo HDMI 4K, Camisa Polo"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Container & Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Container (Móvel / Organizador) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Container / Móvel *
              </label>
              <select
                required
                value={containerId}
                onChange={e => setContainerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="" disabled>Selecione um container...</option>
                {containers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria (1:N) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoria *
              </label>
              <select
                required
                value={categoriaId}
                onChange={e => setCategoriaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="" disabled>Selecione a categoria...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Sub-localização & Quantidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Sub-localização */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sub-localização (Opcional)
              </label>
              <input
                type="text"
                value={subLocalizacao}
                onChange={e => setSubLocalizacao(e.target.value)}
                placeholder="Ex: Gaveta 2, Prateleira B, Caixa Amarela"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

          </div>

          {/* Preço Unitário & Data de Validade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Preço Unitário */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Valor Unitário (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Data de Validade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data de Validade (Opcional)
              </label>
              <input
                type="date"
                value={dataValidade}
                onChange={e => setDataValidade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

          </div>

          {/* Tags (N:N Multi-select) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5 text-brand-600" /> Tags de Atributos Flexíveis (Múltiplas)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {tags.map(t => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.cor }} />
                    {t.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breve Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Breve Descrição
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Especificações técnicas, observações sobre garantia ou estado de conservação..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Câmera & Upload de Foto */}
          <CameraCapture
            value={fotoUrl}
            onChange={setFotoUrl}
            label="Foto do Item"
          />

          {/* Footer & Botões de Salvar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2">
            
            {!itemToEdit && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={e => handleSubmit(e, true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-brand-600" />
                <span>Salvar e Adicionar Outro</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Item'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
