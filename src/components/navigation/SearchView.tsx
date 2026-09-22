import React from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { ItemWithDetails } from '../../types/inventory';
import { ItemCard } from '../items/ItemCard';

interface SearchViewProps {
  items: ItemWithDetails[];
  searchQuery: string;
  onSelectItem: (item: ItemWithDetails) => void;
  onEditItem: (item: ItemWithDetails) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenFilterDrawer: () => void;
  onNavigateToContainer: (containerId: string, ambienteId?: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  items,
  searchQuery,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onOpenFilterDrawer,
  onNavigateToContainer,
}) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const valorTotalResultados = items.reduce((acc, i) => acc + (i.valorTotal || 0), 0);

  return (
    <div className="space-y-6">

      {/* Header dos Resultados da Busca */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
              Sistema de Busca & Filtros Cruzados
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Itens Filtrados'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Encontrados <strong className="text-slate-900">{items.length} objetos</strong> no inventário • Valor Total: <strong className="text-brand-600">{formatBRL(valorTotalResultados)}</strong>
          </p>
        </div>

        <button
          onClick={onOpenFilterDrawer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Adjustar Filtros Cruzados
        </button>
      </div>

      {/* Grid de Itens com Resolução de Caminho Espacial */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum item encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tente pesquisar com outros termos ou ajustar os filtros de categoria, tags e ambiente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => (
            <div key={item.id} className="relative flex flex-col">

              {/* Banner de Caminho Espacial Acima do Card */}
              <div
                onClick={() => {
                  if (item.container_id) {
                    onNavigateToContainer(item.container_id, item.ambiente?.id);
                  }
                }}
                className="bg-slate-900 text-slate-200 px-3 py-1.5 rounded-t-xl text-[11px] font-semibold flex items-center justify-between cursor-pointer hover:bg-brand-700 transition"
                title="Clique para ir direto ao container"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                  <span className="truncate">{item.pathText || 'Local não informado'}</span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
              </div>

              {/* Card do Item */}
              <div className="flex-1 border-t-0 rounded-t-none">
                <ItemCard
                  item={item}
                  onSelect={onSelectItem}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
