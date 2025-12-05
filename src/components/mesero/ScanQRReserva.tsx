'use client';

import { AlertCircle, Camera, CheckCircle, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface ScanQRReservaProps {
  mesas: Mesa[];
  onMesaUpdate: (mesa: Mesa) => void;
}

interface Reserva {
  id: string;
  id_usuario: string;
  usuario_nombre: string;
  fecha_reserva: string;
  hora_reserva: string;
  num_personas: number;
  mesa_asignada?: string;
  codigo_qr: string;
}

export function ScanQRReserva({ mesas, onMesaUpdate }: ScanQRReservaProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedReserva, setScannedReserva] = useState<Reserva | null>(null);
  const [selectedMesaId, setSelectedMesaId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast, showToast, hideToast } = useToast();

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsScanning(true);
      setError('');
    } catch {
      setError('No se pudo acceder a la cámara');
      setIsScanning(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Mock QR scan - in production use a QR library like jsQR or react-qr-reader
  const handleMockScan = async () => {
    setIsLoading(true);

    try {
      // Mock API call - GET /api/reservas/qr?codigo=XXX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock reserva data
      const mockReserva: Reserva = {
        id: 'RES-' + Math.random().toString(36).substr(2, 9),
        id_usuario: 'U' + Math.floor(Math.random() * 100),
        usuario_nombre: 'Juan Pérez',
        fecha_reserva: new Date().toISOString().split('T')[0],
        hora_reserva: '20:00',
        num_personas: 4,
        codigo_qr: 'QR-' + Math.random().toString(36).substr(2, 9),
      };

      setScannedReserva(mockReserva);
      stopCamera();
      showToast('success', '¡Reserva verificada correctamente!');
    } catch {
      showToast('error', 'Error al verificar la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // In production: decode QR from image using jsQR
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success
      const mockReserva: Reserva = {
        id: 'RES-' + Math.random().toString(36).substr(2, 9),
        id_usuario: 'U' + Math.floor(Math.random() * 100),
        usuario_nombre: 'María González',
        fecha_reserva: new Date().toISOString().split('T')[0],
        hora_reserva: '21:30',
        num_personas: 2,
        codigo_qr: 'QR-' + Math.random().toString(36).substr(2, 9),
      };

      setScannedReserva(mockReserva);
      showToast('success', '¡QR procesado correctamente!');
    } catch {
      setError('Error al procesar el código QR');
      setIsScanning(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Assign mesa to reserva
  const handleAssignMesa = async () => {
    if (!selectedMesaId || !scannedReserva) return;

    setIsLoading(true);

    try {
      // Mock API call - PATCH /api/reservas/{id}/asignar-mesa
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mesa = mesas.find((m) => m.id === selectedMesaId);
      if (mesa) {
        onMesaUpdate({
          ...mesa,
          estado: 'OCUPADA',
          pedidos_count: 0,
        });
      }

      showToast('success', `Reserva asignada a ${mesa?.nombre}`);

      // Reset
      setTimeout(() => {
        setScannedReserva(null);
        setSelectedMesaId('');
      }, 2000);
    } catch {
      showToast('error', 'Error al asignar la mesa');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel scan
  const handleCancel = () => {
    setScannedReserva(null);
    setSelectedMesaId('');
    setError('');
    stopCamera();
  };

  // Get available mesas (matching capacity)
  const availableMesas = scannedReserva
    ? mesas.filter(
        (m) =>
          m.estado === 'DISPONIBLE' &&
          m.capacidad >= scannedReserva.num_personas
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Scanner or Result */}
      {!scannedReserva ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          {/* Camera view */}
          {isScanning ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* QR overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-[#F97316] rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <SecondaryButton onClick={stopCamera} className="flex-1">
                  Detener cámara
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleMockScan}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Simular escaneo (demo)
                </PrimaryButton>
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
                Activa la cámara para escanear el código QR de la reserva del
                cliente
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <PrimaryButton onClick={startCamera} className="flex-1">
                  <Camera size={16} />
                  Activar cámara
                </PrimaryButton>

                <label className="flex-1">
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
                    Subir imagen
                  </span>
                </label>
              </div>

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
                  La reserva es válida y está lista para ser procesada
                </p>
              </div>
            </div>

            {/* Reserva details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8FAFC] rounded-lg">
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Cliente</p>
                <p className="text-sm text-[#334155]">
                  {scannedReserva.usuario_nombre}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Fecha</p>
                <p className="text-sm text-[#334155]">
                  {new Date(scannedReserva.fecha_reserva).toLocaleDateString(
                    'es-CL'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Hora</p>
                <p className="text-sm text-[#334155]">
                  {scannedReserva.hora_reserva}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Personas</p>
                <p className="text-sm text-[#334155]">
                  {scannedReserva.num_personas}
                </p>
              </div>
            </div>
          </div>

          {/* Mesa assignment */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="text-[#334155] mb-4">Asignar mesa</h3>

            {availableMesas.length > 0 ? (
              <>
                <p className="text-sm text-[#64748B] mb-4">
                  Selecciona una mesa disponible para{' '}
                  {scannedReserva.num_personas} personas:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {availableMesas.map((mesa) => (
                    <label
                      key={mesa.id}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          selectedMesaId === mesa.id
                            ? 'border-[#F97316] bg-[#FFF7ED]'
                            : 'border-[#E2E8F0] hover:border-[#F97316]/30'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="mesa"
                        value={mesa.id}
                        checked={selectedMesaId === mesa.id}
                        onChange={(e) => setSelectedMesaId(e.target.value)}
                        className="sr-only"
                      />
                      <span
                        className={`text-sm ${
                          selectedMesaId === mesa.id
                            ? 'text-[#F97316]'
                            : 'text-[#334155]'
                        }`}
                      >
                        {mesa.nombre}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        {mesa.capacidad} personas
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <SecondaryButton onClick={handleCancel} className="flex-1">
                    Cancelar
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleAssignMesa}
                    isLoading={isLoading}
                    disabled={isLoading || !selectedMesaId}
                    className="flex-1"
                  >
                    Asignar mesa
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle
                  size={48}
                  className="text-[#F97316] mx-auto mb-4"
                />
                <p className="text-[#334155] mb-2">No hay mesas disponibles</p>
                <p className="text-sm text-[#64748B] mb-4">
                  No hay mesas disponibles con capacidad para{' '}
                  {scannedReserva.num_personas} personas
                </p>
                <SecondaryButton onClick={handleCancel}>Volver</SecondaryButton>
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
