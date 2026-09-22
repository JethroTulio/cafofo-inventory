import React from 'react';
import { ChevronRight, Home, Building2, Box } from 'lucide-react';
import { Local, Ambiente, Container } from '../../types/inventory';

interface BreadcrumbsProps {
  local?: Local | null;
  ambiente?: Ambiente | null;
  container?: Container | null;
  onNavigateHome: () => void;
  onNavigateLocal: (local: Local) => void;
  onNavigateAmbiente: (ambiente: Ambiente) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  local,
  ambiente,
  container,
  onNavigateHome,
  onNavigateLocal,
  onNavigateAmbiente,
}) => {
  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 py-3 px-4 bg-white border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
      <div className="max-w-7xl mx-auto w-full flex items-center gap-1.5">

        {/* Início / Dashboard */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 text-slate-600 hover:text-brand-600 transition font-semibold"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Início</span>
        </button>

        {/* Local (Nível 0) */}
        {local && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onNavigateLocal(local)}
              className={`flex items-center gap-1 transition ${
                !ambiente ? 'text-brand-600 font-bold' : 'text-slate-600 hover:text-brand-600 font-semibold'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{local.nome}</span>
            </button>
          </>
        )}

        {/* Ambiente (Nível 1) */}
        {ambiente && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onNavigateAmbiente(ambiente)}
              className={`flex items-center gap-1 transition ${
                !container ? 'text-brand-600 font-bold' : 'text-slate-600 hover:text-brand-600 font-semibold'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>{ambiente.nome}</span>
            </button>
          </>
        )}

        {/* Container (Nível 2) */}
        {container && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="flex items-center gap-1 text-brand-600 font-bold">
              <Box className="w-3.5 h-3.5 text-amber-600" />
              <span>{container.nome}</span>
            </span>
          </>
        )}

      </div>
    </nav>
  );
};
