import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Database, Filter } from 'lucide-react';
import { ItemWithDetails } from '../../types/inventory';
import { exportInventoryToExcel, exportInventoryToCSV } from '../../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allItems: ItemWithDetails[];
  filteredItems: ItemWithDetails[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  allItems,
  filteredItems,
}) => {
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  if (!isOpen) return null;

  const targetItems = scope === 'all' ? allItems : filteredItems;

  const handleExport = () => {
    if (targetItems.length === 0) {
      alert('Nenhum item disponível para exportação com os parâmetros selecionados.');
      return;
    }

    const filename = scope === 'all' ? 'backup_completo_inventario' : 'visao_filtrada_inventario';

    if (format === 'xlsx') {
      exportInventoryToExcel(targetItems, filename);
    } else {
      exportInventoryToCSV(targetItems, filename);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Exportar Dados & Backup</h2>
              <p className="text-xs text-slate-500">Relatórios em planilha com desnormalização</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* 1. Seleção de Escopo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Escopo da Exportação
            </label>
            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  scope === 'all'
                    ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-4 h-4 text-brand-600" />
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {allItems.length} itens
                  </span>
                </div>
                <span className="text-xs font-bold block">Backup Completo</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Todo o banco de dados</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  scope === 'filtered'
                    ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {filteredItems.length} itens
                  </span>
                </div>
                <span className="text-xs font-bold block">Visão Atual</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Apenas itens filtrados</span>
              </button>

            </div>
          </div>

          {/* 2. Formato do Arquivo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Formato do Arquivo
            </label>
            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  format === 'xlsx'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">Excel (.XLSX)</span>
                  <span className="text-[10px] text-slate-500">Formatado com colunas</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  format === 'csv'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">CSV Universal</span>
                  <span className="text-[10px] text-slate-500">Compatível UTF-8</span>
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {format.toUpperCase()} ({targetItems.length} registros)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
