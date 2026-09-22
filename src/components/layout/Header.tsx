import React, { useState } from 'react';
import { Search, QrCode, Download, Plus, Cloud, Home, Package, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { FilterOptions } from '../../types/inventory';

interface HeaderProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onOpenScanner: () => void;
  onOpenItemModal: () => void;
  onOpenContainerModal: () => void;
  onOpenAmbienteModal: () => void;
  onOpenLocalModal: () => void;
  onOpenExportModal: () => void;
  onOpenCloudSettings: () => void;
  onOpenFilterDrawer: () => void;
  onResetSeedData: () => void;
  activeView: 'dashboard' | 'spatial' | 'search';
  setActiveView: (view: 'dashboard' | 'spatial' | 'search') => void;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onOpenScanner,
  onOpenItemModal,
  onOpenContainerModal,
  onOpenAmbienteModal,
  onOpenLocalModal,
  onOpenExportModal,
  onOpenCloudSettings,
  onOpenFilterDrawer,
  onResetSeedData,
  activeView,
  setActiveView,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onFilterChange({ ...filters, searchQuery: val });
    if (val && activeView !== 'search') {
      setActiveView('search');
    }
  };

  const hasActiveFilters = Boolean(
    filters.ambienteId || filters.containerId || filters.categoriaId || filters.tagIds.length > 0 || filters.expiringDays || filters.onlyExpired
  );

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-4">

          {/* Logo & Marca Oficial (Sem "powered " para economizar espaço horizontal no celular) */}
          <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0" onClick={() => setActiveView('dashboard')}>
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-xl text-white shadow-md shadow-brand-500/20">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-base font-black text-slate-900 tracking-tight block leading-none">
                Cafofo <span className="text-brand-600">Inventory</span>
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold tracking-wider block leading-tight mt-0.5">
                by <span className="text-indigo-600 font-extrabold">Tull_LAB</span>
              </span>
            </div>
          </div>

          {/* Barra de Pesquisa Persistente Global */}
          <div className="flex-1 min-w-0 max-w-xl relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={handleSearchChange}
                placeholder="Pesquisar..."
                className="w-full pl-8 pr-7 sm:pl-9 sm:pr-8 py-1 sm:py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-brand-500 rounded-full text-[11px] sm:text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={onOpenFilterDrawer}
                className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${
                  hasActiveFilters ? 'bg-brand-100 text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Filtros avançados"
              >
                <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Botões de Ação Principais (Ultra-compactos no celular para não transbordar) */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Leitor de QR Code */}
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg sm:rounded-xl transition"
              title="Scanner de QR Code"
            >
              <QrCode className="w-4 h-4 text-brand-600" />
              <span className="hidden md:inline">Ler QR Code</span>
            </button>

            {/* Menu Adicionar (+) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1 p-1.5 sm:px-3.5 sm:py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg sm:rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Cadastrar</span>
              </button>

              {showAddMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => { setShowAddMenu(false); onOpenItemModal(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-brand-600" /> Novo Item
                  </button>
                  <button
                    onClick={() => { setShowAddMenu(false); onOpenContainerModal(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <BoxIcon className="w-4 h-4 text-amber-500" /> Novo Container
                  </button>
                  <button
                    onClick={() => { setShowAddMenu(false); onOpenAmbienteModal(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Home className="w-4 h-4 text-emerald-500" /> Novo Ambiente
                  </button>
                  <button
                    onClick={() => { setShowAddMenu(false); onOpenLocalModal(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <BuildingIcon className="w-4 h-4 text-indigo-600" /> Novo Local (Imóvel)
                  </button>
                </div>
              )}
            </div>

            {/* Botão Exportar */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:rounded-xl transition"
              title="Exportar Dados (Excel / CSV)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Configurações de Nuvem / Reset */}
            <button
              type="button"
              onClick={onOpenCloudSettings}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:rounded-xl transition"
              title="Configurações de Nuvem (Supabase)"
            >
              <Cloud className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onResetSeedData}
              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg sm:rounded-xl transition"
              title="Recarregar Dados Demonstrativos Padrão"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7m4 4h4m-4 0H7" />
    </svg>
  );
}
