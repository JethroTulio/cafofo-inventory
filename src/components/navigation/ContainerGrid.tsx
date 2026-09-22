import React from 'react';
import { Box, Plus, QrCode, ArrowUpRight, Trash2, Edit } from 'lucide-react';
import { Ambiente, Container, ItemWithDetails } from '../../types/inventory';

interface ContainerGridProps {
  ambiente: Ambiente;
  containers: Container[];
  items: ItemWithDetails[];
  onSelectContainer: (container: Container) => void;
  onOpenAddContainer: () => void;
  onEditContainer: (container: Container) => void;
  onDeleteContainer: (containerId: string) => void;
  onPrintContainerLabel: (container: Container) => void;
}

export const ContainerGrid: React.FC<ContainerGridProps> = ({
  ambiente,
  containers,
  items,
  onSelectContainer,
  onOpenAddContainer,
  onEditContainer,
  onDeleteContainer,
  onPrintContainerLabel,
}) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">

      {/* Cabeçalho do Ambiente */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            <img
              src={ambiente.foto_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'}
              alt={ambiente.nome}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                Ambiente (Nível 1)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{ambiente.nome}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{ambiente.descricao || 'Sem descrição informada'}</p>
          </div>
        </div>

        <button
          onClick={onOpenAddContainer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Container / Móvel
        </button>
      </div>

      {/* Grid de Containers */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Móveis e Organizadores neste Ambiente</h2>

        {containers.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum container cadastrado aqui</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cadastre gaveteiros, armários, prateleiras ou caixas para organizar seus objetos.
            </p>
            <button
              onClick={onOpenAddContainer}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition"
            >
              Adicionar Container
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {containers.map(container => {
              const containerItems = items.filter(i => i.container_id === container.id);
              const valorContainer = containerItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
              const countContainer = containerItems.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);

              return (
                <div
                  key={container.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div
                    onClick={() => onSelectContainer(container)}
                    className="relative h-40 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={container.foto_url || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'}
                      alt={container.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-base font-bold tracking-tight">{container.nome}</h3>
                    </div>
                  </div>

                  <div className="p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Itens Guardados</span>
                      <span className="font-bold text-slate-900">{countContainer} unidades</span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Valor Estimado</span>
                      <span className="font-bold text-brand-600">{formatBRL(valorContainer)}</span>
                    </div>

                    {/* Botões de Ações */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPrintContainerLabel(container)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          title="Gerar Etiqueta QR Code em PDF"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditContainer(container)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar Container"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteContainer(container.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir Container"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectContainer(container)}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        Ver Itens <ArrowUpRight className="w-3.5 h-3.5" />
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
