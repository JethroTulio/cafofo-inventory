import React from 'react';
import { DollarSign, Package, AlertTriangle, Building2, ArrowUpRight, Home, Tag as TagIcon } from 'lucide-react';
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
    <div className="space-y-6 pb-12">

      {/* Banner de Boas Vindas & Cards de KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Total Financeiro da Casa */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white shadow-lg shadow-brand-600/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">Patrimônio Total</span>
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{formatBRL(valorTotalCasa)}</h2>
            <p className="text-xs text-brand-100/90 mt-1 font-medium">Soma de todos os locais registrados</p>
          </div>
        </div>

        {/* Quantidade Total de Itens */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Itens Cadastrados</span>
            <div className="p-2 bg-slate-100 rounded-xl">
              <Package className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{totalItensCount}</h2>
            <p className="text-xs text-slate-500 mt-1">Objetos mapeados no inventário</p>
          </div>
        </div>

        {/* Locais Mapeados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Locais / Imóveis</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{locais.length}</h2>
            <p className="text-xs text-slate-500 mt-1">{ambientes.length} ambientes distribuídos</p>
          </div>
        </div>

        {/* Alerta de Validade */}
        <div
          onClick={() => onFilterExpiring(30)}
          className={`rounded-2xl p-5 border shadow-sm cursor-pointer transition flex flex-col justify-between ${
            itensVencidos.length > 0
              ? 'bg-red-50 border-red-200 hover:bg-red-100/80'
              : itensProximosVencer.length > 0
              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/80'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Controle de Validade</span>
            <div className={`p-2 rounded-xl ${itensVencidos.length > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {itensVencidos.length + itensProximosVencer.length}
              </h2>
              <span className="text-xs font-semibold text-slate-600">itens em alerta</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {itensVencidos.length > 0 ? `${itensVencidos.length} já vencidos!` : `${itensProximosVencer.length} vencem em 30 dias`}
            </p>
          </div>
        </div>

      </div>

      {/* Navegação por Locais (Nível 0 Espacial) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Locais e Propriedades (Nível 0)
            </h3>
            <p className="text-xs text-slate-500">Selecione um local (Apartamento, Trabalho, Casa da Mãe) para ver os cômodos</p>
          </div>
          <button
            onClick={onOpenAddLocal}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition"
          >
            + Adicionar Local
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {valorPorLocal.map(({ local, valor, count, ambCount }) => (
            <div
              key={local.id}
              onClick={() => onSelectLocal(local)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={local.foto_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                  alt={local.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h4 className="text-lg font-bold tracking-tight">{local.nome}</h4>
                  <p className="text-xs text-slate-200 line-clamp-1">{local.descricao || 'Sem descrição'}</p>
                </div>
              </div>

              <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Valor Acumulado</span>
                  <span className="text-sm font-bold text-slate-900">{formatBRL(valor)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full">
                    {ambCount} {ambCount === 1 ? 'ambiente' : 'ambientes'} • {count} itens
                  </span>
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção Gráfica e Visualização de Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Valor por Categoria */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
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
