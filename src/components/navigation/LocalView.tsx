import React from 'react';
import { Home, Plus, Building2, ArrowUpRight, Edit, Trash2 } from 'lucide-react';
import { Local, Ambiente, ItemWithDetails } from '../../types/inventory';

interface LocalViewProps {
  local: Local;
  ambientes: Ambiente[];
  items: ItemWithDetails[];
  onSelectAmbiente: (ambiente: Ambiente) => void;
  onOpenAddAmbiente: () => void;
  onEditLocal: (local: Local) => void;
  onDeleteLocal: (localId: string) => void;
  onEditAmbiente: (ambiente: Ambiente) => void;
  onDeleteAmbiente: (ambienteId: string) => void;
}

export const LocalView: React.FC<LocalViewProps> = ({
  local,
  ambientes,
  items,
  onSelectAmbiente,
  onOpenAddAmbiente,
  onEditLocal,
  onDeleteLocal,
  onEditAmbiente,
  onDeleteAmbiente,
}) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const localItems = items.filter(i => i.local?.id === local.id);
  const valorTotalLocal = localItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
  const countLocalItems = localItems.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);

  return (
    <div className="space-y-6">

      {/* Cabeçalho do Local / Propriedade */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            <img
              src={local.foto_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
              alt={local.nome}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Local / Imóvel (Nível 0)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{local.nome}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span>Cômodos: <strong className="text-slate-900">{ambientes.length}</strong></span>
              <span>•</span>
              <span>Itens: <strong className="text-slate-900">{countLocalItems} objetos</strong></span>
              <span>•</span>
              <span>Valor: <strong className="text-brand-600">{formatBRL(valorTotalLocal)}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEditLocal(local)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            title="Editar Local"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteLocal(local.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200"
            title="Excluir Local"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddAmbiente}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Novo Ambiente
          </button>
        </div>
      </div>

      {/* Grid de Ambientes deste Local */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Ambientes e Cômodos deste Local</h2>

        {ambientes.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum ambiente cadastrado neste local</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cadastre os cômodos (Escritório, Cozinha, Sala, Quarto, Garagem) deste imóvel.
            </p>
            <button
              onClick={onOpenAddAmbiente}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
            >
              Adicionar Ambiente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ambientes.map(amb => {
              const ambItems = items.filter(i => i.ambiente?.id === amb.id);
              const valorAmbiente = ambItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
              const countAmbiente = ambItems.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);

              return (
                <div
                  key={amb.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div
                    onClick={() => onSelectAmbiente(amb)}
                    className="relative h-40 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={amb.foto_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'}
                      alt={amb.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-base font-bold tracking-tight">{amb.nome}</h3>
                      <p className="text-xs text-slate-200 line-clamp-1">{amb.descricao || 'Sem descrição'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Itens Guardados</span>
                      <span className="font-bold text-slate-900">{countAmbiente} objetos</span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Valor Estimado</span>
                      <span className="font-bold text-brand-600">{formatBRL(valorAmbiente)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditAmbiente(amb)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar Ambiente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAmbiente(amb.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir Ambiente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectAmbiente(amb)}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        Ver Containers <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
