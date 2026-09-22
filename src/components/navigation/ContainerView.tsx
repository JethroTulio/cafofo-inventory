import React, { useState } from 'react';
import { Package, Plus, QrCode, MapPin, ArrowLeft } from 'lucide-react';
import { Container, Ambiente, ItemWithDetails } from '../../types/inventory';
import { ItemCard } from '../items/ItemCard';

interface ContainerViewProps {
  container: Container;
  ambiente?: Ambiente;
  items: ItemWithDetails[];
  onBack: () => void;
  onSelectItem: (item: ItemWithDetails) => void;
  onOpenAddItem: () => void;
  onEditItem: (item: ItemWithDetails) => void;
  onDeleteItem: (itemId: string) => void;
  onPrintLabel: (container: Container) => void;
}

export const ContainerView: React.FC<ContainerViewProps> = ({
  container,
  ambiente,
  items,
  onBack,
  onSelectItem,
  onOpenAddItem,
  onEditItem,
  onDeleteItem,
  onPrintLabel,
}) => {
  const [selectedSubLoc, setSelectedSubLoc] = useState<string | null>(null);

  // Extrair sub-localizações únicas (ex: Gaveta 1, Gaveta 2, Prateleira)
  const subLocalizacoes = Array.from(
    new Set(items.map(i => i.sub_localizacao).filter(Boolean) as string[])
  );

  const filteredItems = selectedSubLoc
    ? items.filter(i => i.sub_localizacao === selectedSubLoc)
    : items;

  const valorTotalContainer = items.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
  const totalQuantidade = items.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">

      {/* Cabeçalho do Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Voltar ao Ambiente"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            <img
              src={container.foto_url || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'}
              alt={container.nome}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                Container (Nível 2) • {ambiente?.nome || 'Ambiente'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{container.nome}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span>Total: <strong className="text-slate-900">{totalQuantidade} objetos</strong></span>
              <span>•</span>
              <span>Valor: <strong className="text-brand-600">{formatBRL(valorTotalContainer)}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onPrintLabel(container)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <QrCode className="w-4 h-4 text-brand-600" />
            <span>Etiqueta QR Code</span>
          </button>

          <button
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item</span>
          </button>
        </div>
      </div>

      {/* Chips de Filtro por Sub-localização (Gaveta 1, Prateleira A, etc.) */}
      {subLocalizacoes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Sub-divisões:
          </span>
          <button
            onClick={() => setSelectedSubLoc(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
              selectedSubLoc === null
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas ({items.length})
          </button>
          {subLocalizacoes.map(subLoc => (
            <button
              key={subLoc}
              onClick={() => setSelectedSubLoc(subLoc)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                selectedSubLoc === subLoc
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {subLoc} ({items.filter(i => i.sub_localizacao === subLoc).length})
            </button>
          ))}
        </div>
      )}

      {/* Lista / Grid de Itens */}
      <div>
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum item encontrado aqui</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Adicione os objetos guardados dentro deste container com foto, valor e tags.
            </p>
            <button
              onClick={onOpenAddItem}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition"
            >
              Cadastrar Primeiro Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
