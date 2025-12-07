'use client';

import { Camera, ImageIcon, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../utils/apiClient';

interface ScanQRClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanQRClienteModal({
  isOpen,
  onClose,
}: ScanQRClienteModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Stop camera when modal closes
  useEffect(() => {
    if (!isOpen && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [isOpen]);

  const startCamera = async () => {
    setMode('camera');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError('No se pudo acceder a la camara. Intenta subir una imagen.');
      setMode('select');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setMode('select');
  };

  const handleValidateQR = useCallback(
    async (codigo: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.cliente.validarQR(codigo);

        if (response.success) {
          stopCamera();
          onClose();
          router.push(`/pedido?qr=${codigo}`);
        } else {
          setError(response.error || 'QR invalido');
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error al validar el QR';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [router, onClose]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMode('upload');
    setIsLoading(true);
    setError(null);

    try {
      // Simular lectura de QR - en produccion usar jsQR
      const reader = new FileReader();
      reader.onload = async () => {
        // Por ahora, pedir codigo manual si no se puede leer
        setIsLoading(false);
        setError(
          'Por ahora, ingresa el codigo manualmente o usa la camara para escanear.'
        );
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Error al procesar la imagen');
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleValidateQR(manualCode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#334155]">Escanear QR</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {mode === 'select' && (
            <div className="space-y-4">
              <p className="text-[#64748B] text-sm text-center mb-6">
                Escanea el codigo QR que te muestra el mesero para hacer tu
                pedido
              </p>

              {/* Camera option */}
              <button
                onClick={startCamera}
                className="w-full flex items-center gap-4 p-4 border-2 border-[#E2E8F0] rounded-xl hover:border-[#F97316] hover:bg-[#FFF7ED] transition-all"
              >
                <div className="w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#334155]">Usar camara</p>
                  <p className="text-sm text-[#64748B]">
                    Escanea el QR con tu camara
                  </p>
                </div>
              </button>

              {/* Upload option */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 border-2 border-[#E2E8F0] rounded-xl hover:border-[#F97316] hover:bg-[#FFF7ED] transition-all"
              >
                <div className="w-12 h-12 bg-[#64748B] rounded-full flex items-center justify-center">
                  <ImageIcon size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#334155]">Subir imagen</p>
                  <p className="text-sm text-[#64748B]">
                    Sube una captura del QR
                  </p>
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Manual code input */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <p className="text-sm text-[#64748B] mb-2">
                  O ingresa el codigo manualmente:
                </p>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: QR-ABC123"
                    className="flex-1 px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!manualCode.trim() || isLoading}
                    className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      'Ir'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Overlay de escaneo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-lg"></div>
                </div>
              </div>

              <p className="text-sm text-[#64748B] text-center">
                Apunta la camara al codigo QR
              </p>

              <div className="flex gap-2">
                <button
                  onClick={stopCamera}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancelar
                </button>
                {/* Boton temporal para simular escaneo */}
                <button
                  onClick={() => {
                    const code = prompt('Ingresa el codigo del QR:');
                    if (code) handleValidateQR(code);
                  }}
                  className="flex-1 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                >
                  Ingresar codigo
                </button>
              </div>
            </div>
          )}

          {mode === 'upload' && isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="text-[#F97316] animate-spin mb-4" />
              <p className="text-[#64748B]">Procesando imagen...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
