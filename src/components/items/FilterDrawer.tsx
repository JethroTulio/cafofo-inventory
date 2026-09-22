import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Building2, Home, Box, Tag as TagIcon, Calendar } from 'lucide-react';
import { FilterOptions, Local, Ambiente, Container, Categoria, Tag } from '../../types/inventory';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  locais: Local[];
  ambientes: Ambiente[];
  containers: Container[];
  categorias: Categoria[];
  tags: Tag[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  locais,
  ambientes,
  containers,
  categorias,
  tags,
}) => {
  if (!isOpen) return null;

  const availableAmbientes = filters.localId
    ? ambientes.filter(a => a.local_id === filters.localId)
    : ambientes;

  const availableContainers = filters.ambienteId
    ? containers.filter(c => c.ambiente_id === filters.ambienteId)
    : filters.localId
    ? containers.filter(c => {
        const amb = ambientes.find(a => a.id === c.ambiente_id);
        return amb && amb.local_id === filters.localId;
      })
    : containers;

  const toggleTag = (tagId: string) => {
    const current = filters.tagIds;
    const updated = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    onFilterChange({ ...filters, tagIds: updated });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      localId: undefined,
      ambienteId: undefined,
      containerId: undefined,
      categoriaId: undefined,
      tagIds: [],
      expiringDays: null,
      onlyExpired: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Filtros Cruzados Avançados</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">

          {/* 0. Hierarquia Espacial: Local / Imóvel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Local / Imóvel
            </label>
            <select
              value={filters.localId || ''}
              onChange={e => onFilterChange({ ...filters, localId: e.target.value || undefined, ambienteId: undefined, containerId: undefined })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            >
              <option value="">Todos os Locais</option>
              {locais.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.nome}</option>
              ))}
            </select>
          </div>

          {/* 1. Hierarquia Espacial: Ambiente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-600" /> Ambiente
            </label>
            <select
              value={filters.ambienteId || ''}
              onChange={e => onFilterChange({ ...filters, ambienteId: e.target.value || undefined, containerId: undefined })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            >
              <option value="">Todos os Ambientes</option>
              {availableAmbientes.map(amb => (
                <option key={amb.id} value={amb.id}>{amb.nome}</option>
              ))}
            </select>
          </div>

          {/* 2. Hierarquia Espacial: Container */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-amber-600" /> Container / Móvel
            </label>
            <select
              value={filters.containerId || ''}
              onChange={e => onFilterChange({ ...filters, containerId: e.target.value || undefined })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            >
              <option value="">Todos os Containers</option>
              {availableContainers.map(cnt => (
                <option key={cnt.id} value={cnt.id}>{cnt.nome}</option>
              ))}
            </select>
          </div>

          {/* 3. Taxonomia: Categoria */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-brand-600" /> Categoria
            </label>
            <select
              value={filters.categoriaId || ''}
              onChange={e => onFilterChange({ ...filters, categoriaId: e.target.value || undefined })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl text-sm font-medium text-slate-900 transition"
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          {/* 4. Taxonomia: Tags Multi-select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-purple-600" /> Tags Selecionadas
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => {
                const isSelected = filters.tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.cor }} />
                    {t.nome}
                    {isSelected && <Check className="w-3 h-3 text-white ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Filtro de Validade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-600" /> Alertas de Validade
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlyExpired || false}
                  onChange={e => onFilterChange({ ...filters, onlyExpired: e.target.checked, expiringDays: null })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Apenas itens já vencidos</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.expiringDays === 30}
                  onChange={e => onFilterChange({ ...filters, expiringDays: e.target.checked ? 30 : null, onlyExpired: false })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Vencimento nos próximos 30 dias</span>
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar Filtros
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            Aplicar Filtros
          </button>
        </div>

      </div>
    </div>
  );
};
