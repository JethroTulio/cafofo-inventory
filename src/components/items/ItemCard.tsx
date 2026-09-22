import React from 'react';
import { Package, Calendar, DollarSign, MapPin, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { ItemWithDetails } from '../../types/inventory';

interface ItemCardProps {
  item: ItemWithDetails;
  onSelect: (item: ItemWithDetails) => void;
  onEdit: (item: ItemWithDetails) => void;
  onDelete: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onEdit, onDelete }) => {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = item.data_validade && item.data_validade < todayStr;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
    >
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={item.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
            <Package className="w-12 h-12" />
          </div>
        )}

        {/* Categoria Badge */}
        {item.categoria && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1"
            style={{ backgroundColor: item.categoria.cor || '#3B82F6' }}
          >
            {item.categoria.nome}
          </span>
        )}

        {/* Badge de Validade Vencida */}
        {isExpired && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 text-white rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" /> VENCIDO
          </span>
        )}

        {/* Sub-localização badge */}
        {item.sub_localizacao && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-xs font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-400" />
            <span>{item.sub_localizacao}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-1">
            {item.nome}
          </h3>
          {item.descricao && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.descricao}</p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map(t => (
                <span
                  key={t.id}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                  style={{ borderColor: t.cor + '40', color: t.cor, backgroundColor: t.cor + '10' }}
                >
                  #{t.nome}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-medium">Qtd: {item.quantidade}x</span>
            <span className="text-sm font-extrabold text-slate-900">{formatBRL(item.valorTotal || 0)}</span>
          </div>

          {item.data_validade && (
            <div className={`text-right text-[11px] font-medium flex items-center gap-1 ${isExpired ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(item.data_validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
