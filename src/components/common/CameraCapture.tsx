import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ value, onChange, label = 'Foto' }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Função auxiliar de compressão de imagem para garantir sincronização rápida no Supabase
  const compressAndSetImage = (imgSource: HTMLVideoElement | HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    let width = (imgSource instanceof HTMLVideoElement ? imgSource.videoWidth : imgSource.width) || 640;
    let height = (imgSource instanceof HTMLVideoElement ? imgSource.videoHeight : imgSource.height) || 480;

    // Redimensionar para tamanho máximo otimizado de 800px (salva como imagem leve de ~90KB)
    const maxDim = 800;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgSource, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      onChange(compressedDataUrl);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      compressAndSetImage(videoRef.current);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.onload = () => {
            compressAndSetImage(img);
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {/* Preview da Foto Atual */}
      {value ? (
        <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-100 shadow"
            >
              Trocar Foto
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isCameraActive ? (
        /* Câmera Ao Vivo */
        <div className="relative w-full h-56 bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-3 flex items-center gap-3">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-lg"
            >
              <Check className="w-4 h-4" /> Capturar Foto
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Botões de Ação para Adicionar Foto */
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/50 rounded-lg text-slate-600 hover:text-brand-600 text-sm font-medium transition"
          >
            <Camera className="w-4 h-4" />
            Tirar Foto
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/50 rounded-lg text-slate-600 hover:text-brand-600 text-sm font-medium transition"
          >
            <Upload className="w-4 h-4" />
            Carregar Arquivo
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};
