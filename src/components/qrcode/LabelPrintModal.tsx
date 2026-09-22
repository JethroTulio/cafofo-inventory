import React, { useState } from 'react';
import { X, Printer, QrCode, CheckSquare, Square, FileText } from 'lucide-react';
import { Container, Ambiente } from '../../types/inventory';
import { generateContainerLabelsPDF, LabelData } from '../../services/pdfService';
import { QRCodeSVG } from 'qrcode.react';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Container[];
  ambientes: Ambiente[];
  selectedContainerId?: string;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
  isOpen,
  onClose,
  containers,
  ambientes,
  selectedContainerId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedContainerId ? [selectedContainerId] : containers.map(c => c.id)
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const ambienteMap = new Map<string, Ambiente>(ambientes.map(a => [a.id, a]));

  const toggleSelectAll = () => {
    if (selectedIds.length === containers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(containers.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportPDF = async () => {
    if (selectedIds.length === 0) {
      alert('Selecione pelo menos 1 container para gerar as etiquetas.');
      return;
    }

    setIsGenerating(true);
    try {
      const labelsToPrint: LabelData[] = containers
        .filter(c => selectedIds.includes(c.id))
        .map(container => ({
          container,
          ambiente: ambienteMap.get(container.ambiente_id)
        }));

      await generateContainerLabelsPDF(labelsToPrint);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar o PDF de etiquetas.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">

        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Exportar Etiquetas para Impressão</h2>
              <p className="text-xs text-slate-500">Gera um PDF formatado com QR Codes e identificação humana</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Selecione os Containers ({selectedIds.length} de {containers.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              {selectedIds.length === containers.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {selectedIds.length === containers.length ? 'Desmarcar Todos' : 'Marcar Todos'}
            </button>
          </div>

          {/* Grid de Lista de Containers Selecionáveis com Preview do QR */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {containers.map(container => {
              const isSelected = selectedIds.includes(container.id);
              const amb = ambienteMap.get(container.ambiente_id);

              return (
                <div
                  key={container.id}
                  onClick={() => toggleSelect(container.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-50/50 border-brand-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
                      <QRCodeSVG value={`${window.location.origin}/#/container/${container.id}`} size={36} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{container.nome}</h4>
                      <p className="text-xs text-slate-500 font-medium">Ambiente: {amb?.nome || 'Desconhecido'}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-brand-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Dica de Impressão */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <FileText className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              As etiquetas são formatadas em folha A4 em tamanho padrão para fácil colagem em caixas, móveis e organizadores.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isGenerating || selectedIds.length === 0}
            onClick={handleExportPDF}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{isGenerating ? 'Gerando PDF...' : `Gerar PDF (${selectedIds.length} etiquetas)`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
