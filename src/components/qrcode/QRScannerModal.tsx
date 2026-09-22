import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (containerId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pequeno timeout para garantir montagem da DIV #qr-reader
      const timer = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            'qr-reader',
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              // Extrair ID do container da URL / deep link ou texto bruto
              let containerId = decodedText;
              if (decodedText.includes('/container/')) {
                const parts = decodedText.split('/container/');
                containerId = parts[parts.length - 1].split('?')[0].split('#')[0];
              }

              if (containerId) {
                scanner.clear().catch(err => console.error(err));
                onScanResult(containerId.trim());
                onClose();
              }
            },
            (_error) => {
              // Erros de leitura normais a cada frame quando não há QR code na tela
            }
          );

          scannerRef.current = scanner;
        } catch (e) {
          console.error('Erro ao iniciar scanner QR:', e);
        }
      }, 200);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error(err));
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scanner de QR Code</h3>
              <p className="text-xs text-slate-500">Aponte para a etiqueta do Container</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Câmera do Scanner */}
        <div className="p-6">
          <div id="qr-reader" className="overflow-hidden rounded-xl border border-slate-200" />
        </div>

        {/* Footer explicativo */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            O scanner abrirá diretamente os itens guardados no container.
          </p>
        </div>

      </div>
    </div>
  );
};
