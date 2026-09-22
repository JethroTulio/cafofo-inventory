import React from 'react';
import { X, Edit, Trash2, MapPin, Calendar, DollarSign, Package, Tag as TagIcon, ExternalLink } from 'lucide-react';
import { ItemWithDetails } from '../../types/inventory';

interface ItemDetailModalProps {
  item: ItemWithDetails | null;
  onClose: () => void;
  onEdit: (item: ItemWithDetails) => void;
  onDelete: (itemId: string) => void;
  onNavigatePath?: (ambienteId?: string, containerId?: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
  onNavigatePath,
}) => {
  if (!item) return null;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = item.data_validade && item.data_validade < todayStr;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">

        {/* Header com Foto grande */}
        <div className="relative h-64 bg-slate-900 overflow-hidden">
          {item.foto_url ? (
            <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Package className="w-16 h-16" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Categoria Badge */}
          {item.categoria && (
            <span
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: item.categoria.cor || '#3B82F6' }}
            >
              {item.categoria.nome}
            </span>
          )}

          {/* Título & Caminho */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl font-extrabold tracking-tight line-clamp-1">{item.nome}</h2>
            <p
              onClick={() => {
                if (onNavigatePath) onNavigatePath(item.ambiente?.id, item.container_id);
                onClose();
              }}
              className="text-xs text-slate-200 mt-1 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{item.pathText || 'Localização não informada'}</span>
              <ExternalLink className="w-3 h-3 text-slate-300 ml-1" />
            </p>
          </div>
        </div>

        {/* Body com Informações */}
        <div className="p-6 space-y-4">

          {/* Preço e Quantidade */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Quantidade em Estoque</span>
              <span className="text-lg font-bold text-slate-900">{item.quantidade} unidades</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Valor Total Estimado</span>
              <span className="text-lg font-extrabold text-brand-600">{formatBRL(item.valorTotal || 0)}</span>
              <span className="text-[10px] text-slate-400 block">({formatBRL(item.preco)}/unid)</span>
            </div>
          </div>

          {/* Validade */}
          {item.data_validade && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Calendar className="w-4 h-4 text-red-500" />
              <span>Data de Validade: {new Date(item.data_validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              {isExpired && <span className="ml-auto font-bold underline">VENCIDO!</span>}
            </div>
          )}

          {/* Descrição */}
          {item.descricao && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição</h4>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{item.descricao}</p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" /> Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map(t => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold border"
                    style={{ borderColor: t.cor + '40', color: t.cor, backgroundColor: t.cor + '10' }}
                  >
                    #{t.nome}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer de Ações */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este item?')) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Excluir Item
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" /> Editar Item
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
