import React, { useState } from 'react';
import { DollarSign, Package, AlertTriangle, Building2, ArrowUpRight, Home, Tag as TagIcon, LayoutGrid } from 'lucide-react';
import { Local, Ambiente, ItemWithDetails } from '../../types/inventory';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  locais: Local[];
  ambientes: Ambiente[];
  items: ItemWithDetails[];
  onSelectLocal: (local: Local) => void;
  onSelectAmbiente: (ambiente: Ambiente) => void;
  onFilterExpiring: (days: number) => void;
  onFilterCategory: (catId: string) => void;
  onOpenAddLocal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  locais,
  ambientes,
  items,
  onSelectLocal,
  onSelectAmbiente,
  onFilterExpiring,
  onFilterCategory,
  onOpenAddLocal,
}) => {
  const [activeTab, setActiveTab] = useState<'locais' | 'ambientes'>('locais');

  // 1. Cálculos de Totais Financeiros
  const valorTotalCasa = items.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
  const totalItensCount = items.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);

  // 2. Alertas de Validade (próximos 30 dias ou vencidos)
  const todayStr = new Date().toISOString().split('T')[0];
  const limit30Days = new Date();
  limit30Days.setDate(limit30Days.getDate() + 30);
  const limit30Str = limit30Days.toISOString().split('T')[0];

  const itensVencidos = items.filter(i => i.data_validade && i.data_validade < todayStr);
  const itensProximosVencer = items.filter(i => i.data_validade && i.data_validade >= todayStr && i.data_validade <= limit30Str);

  // 3. Distribuição por Local
  const valorPorLocal = locais.map(local => {
    const localItems = items.filter(i => i.local?.id === local.id);
    const valor = localItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
    const count = localItems.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);
    const ambCount = ambientes.filter(a => a.local_id === local.id).length;
    return {
      local,
      valor,
      count,
      ambCount,
      nome: local.nome
    };
  });

  // 4. Distribuição por Categoria
  const categoriaMap = new Map<string, { nome: string; valor: number; cor: string; id: string }>();
  items.forEach(i => {
    if (i.categoria) {
      const existing = categoriaMap.get(i.categoria.id) || { nome: i.categoria.nome, valor: 0, cor: i.categoria.cor, id: i.categoria.id };
      existing.valor += i.valorTotal || 0;
      categoriaMap.set(i.categoria.id, existing);
    }
  });
  const dadosCategorias = Array.from(categoriaMap.values());

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-5 pb-12">

      {/* Cards de KPIs Principais (Layout Ultra-Compacto em Grade 2x2 no Celular) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">

        {/* Total Financeiro da Casa */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-md shadow-brand-600/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-100">Patrimônio</span>
            <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl">
              <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-sm sm:text-2xl font-extrabold tracking-tight truncate">{formatBRL(valorTotalCasa)}</h2>
            <p className="hidden sm:block text-xs text-brand-100/90 mt-1 font-medium">Soma total registrada</p>
          </div>
        </div>

        {/* Quantidade Total de Itens */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Itens</span>
            <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg sm:rounded-xl">
              <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-700" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-sm sm:text-2xl font-bold text-slate-900 tracking-tight">
              {totalItensCount} <span className="text-[10px] sm:text-xs font-normal text-slate-500">objetos</span>
            </h2>
            <p className="hidden sm:block text-xs text-slate-500 mt-1">Mapeados no sistema</p>
          </div>
        </div>

        {/* Locais Mapeados */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Locais</span>
            <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg sm:rounded-xl text-indigo-600">
              <Building2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-sm sm:text-2xl font-bold text-slate-900 tracking-tight">
              {locais.length} <span className="text-[10px] sm:text-xs font-normal text-slate-500">imóveis</span>
            </h2>
            <p className="hidden sm:block text-xs text-slate-500 mt-1">{ambientes.length} ambientes</p>
          </div>
        </div>

        {/* Alerta de Validade */}
        <div
          onClick={() => onFilterExpiring(30)}
          className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 border shadow-sm cursor-pointer transition flex flex-col justify-between ${
            itensVencidos.length > 0
              ? 'bg-red-50 border-red-200 hover:bg-red-100/80'
              : itensProximosVencer.length > 0
              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/80'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">Validade</span>
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${itensVencidos.length > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <h2 className="text-sm sm:text-2xl font-bold text-slate-900 tracking-tight">
              {itensVencidos.length + itensProximosVencer.length} <span className="text-[10px] sm:text-xs font-normal text-slate-500">alertas</span>
            </h2>
            <p className="hidden sm:block text-xs text-slate-600 mt-1">
              {itensVencidos.length > 0 ? `${itensVencidos.length} vencidos!` : `${itensProximosVencer.length} vencem em 30 dias`}
            </p>
          </div>
        </div>

      </div>

      {/* Seletor de Abas para Acesso Rápido no Celular: Locais vs Ambientes */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">

          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('locais')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'locais'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Locais / Imóveis ({locais.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ambientes')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ambientes'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Todos os Ambientes ({ambientes.length})</span>
            </button>
          </div>

          {activeTab === 'locais' && (
            <button
              onClick={onOpenAddLocal}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition self-end sm:self-auto"
            >
              + Adicionar Local
            </button>
          )}
        </div>

        {/* Conteúdo da Aba 1: Locais */}
        {activeTab === 'locais' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {valorPorLocal.map(({ local, valor, count, ambCount }) => (
              <div
                key={local.id}
                onClick={() => onSelectLocal(local)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-32 sm:h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={local.foto_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                    alt={local.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h4 className="text-base sm:text-lg font-bold tracking-tight">{local.nome}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1">{local.descricao || 'Sem descrição'}</p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">Valor Acumulado</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{formatBRL(valor)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full">
                      {ambCount} cômodos • {count} itens
                    </span>
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conteúdo da Aba 2: Lista Direta de Todos os Ambientes (Acesso 1-Tap no Celular) */}
        {activeTab === 'ambientes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ambientes.map(amb => {
              const localDesteAmbiente = locais.find(l => l.id === amb.local_id);
              const ambItems = items.filter(i => i.ambiente?.id === amb.id);
              const valorAmb = ambItems.reduce((acc, i) => acc + (i.valorTotal || 0), 0);
              const countAmb = ambItems.reduce((acc, i) => acc + (Number(i.quantidade) || 1), 0);

              return (
                <div
                  key={amb.id}
                  onClick={() => onSelectAmbiente(amb)}
                  className="bg-white rounded-xl p-3 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow transition cursor-pointer flex items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={amb.foto_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'}
                      alt={amb.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{amb.nome}</h4>
                      <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{localDesteAmbiente?.nome || 'Local'}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                      <span className="font-semibold">{countAmb} objetos</span>
                      <span className="font-bold text-brand-600">{formatBRL(valorAmb)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Seção Gráfica e Visualização de Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">

        {/* Gráfico de Valor por Categoria */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-brand-600" /> Valor Armazenado por Categoria
          </h3>
          {dadosCategorias.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosCategorias}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {dadosCategorias.map((cat, index) => (
                      <Cell key={`cell-${index}`} fill={cat.cor || '#0284c7'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatBRL(Number(value)), 'Valor Total']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-48 space-y-1.5 overflow-y-auto max-h-56 pr-2">
                {dadosCategorias.map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => onFilterCategory(cat.id)}
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.cor }} />
                      <span className="font-medium text-slate-700 truncate">{cat.nome}</span>
                    </div>
                    <span className="font-bold text-slate-900 ml-1">{formatBRL(cat.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Sem dados suficientes</div>
          )}
        </div>

        {/* Gráfico de Barras: Valor por Local */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> Valor Financeiro por Local
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valorPorLocal} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `R$${val}`} />
                <Tooltip formatter={(value: any) => [formatBRL(Number(value)), 'Valor Total']} />
                <Bar dataKey="valor" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
