'use client';

import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Keyboard,
  Upload,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface ScanQRReservaProps {
  mesas: Mesa[];
  onMesaUpdate: (mesa: Mesa) => void;
}

interface Reserva {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_telefono?: string;
  fecha_reserva: string;
  hora_reserva: string;
  num_personas: number;
  estado: string;
  mesas: string[];
  codigo_qr: string;
  puede_confirmar: boolean;
  ventana_estado: 'temprano' | 'activa' | 'tarde';
  minutos_hasta_reserva: number;
}

export function ScanQRReserva({ mesas, onMesaUpdate }: ScanQRReservaProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedReserva, setScannedReserva] = useState<Reserva | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Start camera with QR scanning
  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // QR detectado exitosamente
          await html5QrCode.stop();
          html5QrCodeRef.current = null;
          setIsScanning(false);
          await handleValidateQR(decodedText);
        },
        () => {
          // Error de lectura, ignorar
        }
      );

      setIsScanning(true);
      setError('');
    } catch {
      setError('No se pudo acceder a la cámara');
      setIsScanning(false);
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // Ignorar errores al detener
      }
      html5QrCodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, []);

  // Handle QR code validation
  const handleValidateQR = async (codigo: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.empresa.verificarQRReserva(codigo);

      if (response.success) {
        setScannedReserva(response.reserva);
        stopCamera();
      } else {
        setError(response.error || 'Código QR inválido');
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al verificar el código QR';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock QR scan - removed, now uses real scanning

  // Handle file upload with QR detection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file');
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleValidateQR(decodedText);
    } catch {
      setError('No se pudo leer el código QR de la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual code input
  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      setError('Por favor ingresa un código');
      return;
    }
    await handleValidateQR(manualCode.trim());
    setManualCode('');
    setShowManualInput(false);
  };

  // Confirm reservation
  const handleConfirmarReserva = async () => {
    if (!scannedReserva) return;

    setIsConfirming(true);

    try {
      const response = await api.empresa.confirmarReserva(scannedReserva.id);

      if (response.success) {
        // Update mesa estado if needed
        const mesaNombre = response.pedido?.mesa_nombre;
        const mesaActualizada = mesas.find((m) => m.nombre === mesaNombre);
        if (mesaActualizada) {
          onMesaUpdate({
            ...mesaActualizada,
            estado: 'OCUPADA',
            pedidos_count: 1,
          });
        }

        // Reset after delay
        setTimeout(() => {
          setScannedReserva(null);
          setError('');
        }, 2000);
      } else {
        setError(response.error || 'Error al confirmar la reserva');
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al confirmar la reserva';
      setError(errorMsg);
    } finally {
      setIsConfirming(false);
    }
  };

  // Cancel reservation
  const handleCancelarReserva = async () => {
    if (!scannedReserva) return;

    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setIsCanceling(true);

    try {
      await api.empresa.cancelarReserva(scannedReserva.id);

      // Reset after delay
      setTimeout(() => {
        setScannedReserva(null);
        setError('');
      }, 1500);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al cancelar la reserva';
      setError(errorMsg);
    } finally {
      setIsCanceling(false);
    }
  };

  // Cancel scan
  const handleCancel = () => {
    setScannedReserva(null);
    setError('');
    stopCamera();
  };

  // Format time remaining
  const formatTimeRemaining = (minutes: number) => {
    const absMinutes = Math.abs(minutes);

    if (absMinutes < 1) {
      const seconds = Math.round(absMinutes * 60);
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }

    if (absMinutes < 60) {
      return `${Math.floor(absMinutes)} minuto${
        Math.floor(absMinutes) !== 1 ? 's' : ''
      }`;
    }

    const hours = Math.floor(absMinutes / 60);
    const remainingMinutes = Math.floor(absMinutes % 60);

    if (absMinutes < 1440) {
      // menos de 24 horas
      if (remainingMinutes === 0) {
        return `${hours} hora${hours !== 1 ? 's' : ''}`;
      }
      return `${hours} hora${
        hours !== 1 ? 's' : ''
      } y ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
    }

    const days = Math.floor(absMinutes / 1440);
    const remainingHours = Math.floor((absMinutes % 1440) / 60);

    if (remainingHours === 0) {
      return `${days} día${days !== 1 ? 's' : ''}`;
    }
    return `${days} día${days !== 1 ? 's' : ''} y ${remainingHours} hora${
      remainingHours !== 1 ? 's' : ''
    }`;
  };

  // Get status message based on ventana_estado
  const getVentanaMessage = () => {
    if (!scannedReserva) return null;

    const { ventana_estado, minutos_hasta_reserva } = scannedReserva;

    if (ventana_estado === 'temprano') {
      return {
        type: 'warning' as const,
        message: `Faltan ${formatTimeRemaining(
          minutos_hasta_reserva
        )} para la hora de reserva. Podrás confirmar 15 minutos antes.`,
      };
    } else if (ventana_estado === 'tarde') {
      return {
        type: 'error' as const,
        message: `Han pasado ${formatTimeRemaining(
          minutos_hasta_reserva
        )} desde la hora de reserva. Ya no se puede confirmar.`,
      };
    } else {
      return {
        type: 'success' as const,
        message: 'La reserva está en el horario válido para confirmar.',
      };
    }
  };

  const ventanaMessage = getVentanaMessage();

  return (
    <div className="space-y-6">
      {/* Scanner or Result */}
      {!scannedReserva ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          {/* Camera view */}
          {isScanning ? (
            <div className="space-y-4">
              {/* QR Reader container */}
              <div id="qr-reader" className="w-full"></div>

              <SecondaryButton onClick={stopCamera} className="w-full">
                Detener cámara
              </SecondaryButton>
            </div>
          ) : showManualInput ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-6">
                <Keyboard size={48} className="text-[#F97316]" />
              </div>

              <h3 className="text-lg text-[#334155] mb-2">
                Ingresar código manualmente
              </h3>
              <p className="text-sm text-[#64748B] mb-6 max-w-md mx-auto">
                Escribe el código QR de la reserva
              </p>

              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleManualSubmit();
                  }}
                  placeholder="Ej: QR-F98091454A73533B"
                  className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#F97316] focus:outline-none text-center uppercase"
                />

                <div className="flex gap-3">
                  <SecondaryButton
                    onClick={() => {
                      setShowManualInput(false);
                      setManualCode('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleManualSubmit}
                    isLoading={isLoading}
                    disabled={isLoading || !manualCode.trim()}
                    className="flex-1"
                  >
                    Verificar
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera size={48} className="text-[#F97316]" />
              </div>

              <h3 className="text-lg text-[#334155] mb-2">
                Escanear código QR
              </h3>
              <p className="text-sm text-[#64748B] mb-6 max-w-md mx-auto">
                Selecciona cómo deseas verificar la reserva
              </p>

              <div className="flex flex-col gap-3 justify-center max-w-md mx-auto">
                <PrimaryButton onClick={startCamera} className="w-full">
                  <Camera size={16} />
                  Escanear con cámara
                </PrimaryButton>

                <label className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <span
                    className="
                    inline-flex items-center justify-center gap-2
                    bg-transparent
                    border-2 border-[#E2E8F0]
                    text-[#334155]
                    rounded-xl
                    transition-all duration-200
                    hover:bg-[#F1F5F9]
                    active:scale-95
                    px-4 py-2.5
                    w-full cursor-pointer
                  "
                  >
                    <Upload size={16} />
                    Subir imagen de QR
                  </span>
                </label>

                <SecondaryButton
                  onClick={() => setShowManualInput(true)}
                  className="w-full"
                >
                  <Keyboard size={16} />
                  Ingresar código manualmente
                </SecondaryButton>
              </div>

              {/* Hidden div for file scanning */}
              <div id="qr-reader-file" className="hidden"></div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 max-w-md mx-auto">
                  <AlertCircle
                    size={16}
                    className="text-red-600 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Reserva verified */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#DCFCE7] rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={24} className="text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-[#334155] mb-1">
                  ✓ Reserva verificada
                </h3>
                <p className="text-sm text-[#64748B]">
                  Información de la reserva
                </p>
              </div>
            </div>

            {/* Reserva details */}
            <div className="p-4 bg-[#F8FAFC] rounded-lg mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                <div className="flex items-start gap-2">
                  <p className="text-sm font-medium text-[#334155] min-w-[75px]">
                    Nombre:
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {scannedReserva.usuario_nombre}
                  </p>
                </div>

                {scannedReserva.usuario_telefono && (
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-medium text-[#334155] min-w-[75px]">
                      Teléfono:
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {scannedReserva.usuario_telefono}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <p className="text-sm font-medium text-[#334155] min-w-[75px]">
                    Fecha:
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {scannedReserva.fecha_reserva} {scannedReserva.hora_reserva}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <p className="text-sm font-medium text-[#334155] min-w-[75px]">
                    Personas:
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {scannedReserva.num_personas}
                  </p>
                </div>

                {scannedReserva.mesas.length > 0 && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <p className="text-sm font-medium text-[#334155] min-w-[75px]">
                      Mesa{scannedReserva.mesas.length > 1 ? 's' : ''}:
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {scannedReserva.mesas.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ventana de confirmación status */}
            {ventanaMessage && (
              <div
                className={`p-3 border rounded-lg mb-6 ${
                  ventanaMessage.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : ventanaMessage.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    ventanaMessage.type === 'success'
                      ? 'text-green-800'
                      : ventanaMessage.type === 'warning'
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }`}
                >
                  {ventanaMessage.message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Mobile order: Confirmar, Rechazar, Volver */}
              <PrimaryButton
                onClick={handleConfirmarReserva}
                disabled={
                  !scannedReserva.puede_confirmar || isConfirming || isCanceling
                }
                isLoading={isConfirming}
                className="flex-1 w-full sm:order-3"
              >
                {isConfirming ? 'Confirmando...' : 'Confirmar'}
              </PrimaryButton>
              <button
                onClick={handleCancelarReserva}
                disabled={isCanceling || isConfirming}
                className="flex-1 w-full px-4 py-2.5 border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:order-2"
              >
                {isCanceling ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    Cancelando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <XCircle size={16} />
                    Rechazar
                  </span>
                )}
              </button>
              <SecondaryButton
                onClick={handleCancel}
                className="flex-1 w-full sm:order-1"
              >
                Volver
              </SecondaryButton>
            </div>

            {!scannedReserva.puede_confirmar && (
              <p className="text-xs text-[#94A3B8] text-center mt-3">
                El botón Confirmar se habilitará 15 minutos antes de la hora
                reservada
              </p>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-red-600 shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
