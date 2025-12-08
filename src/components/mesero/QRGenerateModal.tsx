import { Check, Copy, Minus, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// Props alternativas para uso sin objeto Mesa
interface QRGenerateModalPropsAlt {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  mesaNombre: string;
}

interface QRGenerateModalPropsWithMesa {
  mesa: Mesa;
  onClose: () => void;
}

type QRGenerateModalProps =
  | QRGenerateModalPropsAlt
  | QRGenerateModalPropsWithMesa;

function isAltProps(
  props: QRGenerateModalProps
): props is QRGenerateModalPropsAlt {
  return 'qrUrl' in props;
}

export function QRGenerateModal(props: QRGenerateModalProps) {
  const onClose = props.onClose;
  const mesaNombre = isAltProps(props) ? props.mesaNombre : props.mesa.nombre;
  const mesaId = isAltProps(props) ? null : props.mesa.id;
  const initialQrUrl = isAltProps(props) ? props.qrUrl : null;
  const isOpen = isAltProps(props) ? props.isOpen : true;
  const { socket } = useSocket();

  const [qrCode, setQrCode] = useState(() => initialQrUrl || '');
  const [qrCodeShort, setQrCodeShort] = useState(''); // Solo el código, sin URL
  const [copied, setCopied] = useState(false);
  const [numPersonas, setNumPersonas] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const hasGenerated = useRef(false);

  const generateQRCode = useCallback(async () => {
    if (initialQrUrl) {
      setQrCode(initialQrUrl);
      setShowQR(true);
      return;
    }
    if (!mesaId) return;

    try {
      // Llamar a la API para generar el QR con num_personas
      const data = await api.empresa.generarQRMesa(Number(mesaId), numPersonas);
      // Construir URL completa para el escaneo (frontend URL + ruta)
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/pedido?qr=${data.qr.codigo}`;
      setQrCode(qrUrl);
      setQrCodeShort(data.qr.codigo); // Guardar solo el código
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Error al generar código QR');
    }
  }, [mesaId, initialQrUrl, numPersonas]);

  // Generar QR solo si hay uno inicial (modo preview)
  useEffect(() => {
    if (isOpen && initialQrUrl && !hasGenerated.current) {
      hasGenerated.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void generateQRCode();
    }
  }, [isOpen, initialQrUrl, generateQRCode]);

  // Escuchar evento de QR escaneado para cerrar el modal automáticamente
  useEffect(() => {
    if (!socket || !isOpen || !mesaId) return;

    const handleQREscaneado = (data: { mesa_id: number }) => {
      // Si el QR escaneado es de esta mesa, cerrar el modal
      if (String(data.mesa_id) === mesaId) {
        console.log('QR escaneado para esta mesa, cerrando modal');
        onClose();
      }
    };

    socket.on('qr_escaneado', handleQREscaneado);

    return () => {
      socket.off('qr_escaneado', handleQREscaneado);
    };
  }, [socket, isOpen, mesaId, onClose]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCodeShort);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Generate QR Code using an API or library
  // For demo, we'll use a placeholder with QRCode.js or similar
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrCode
  )}`;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] flex-shrink-0">
          <div>
            <h2 className="text-xl text-[#334155]">
              {showQR ? 'Código QR Generado' : 'Generar Código QR'}
            </h2>
            <p className="text-sm text-[#94A3B8]">{mesaNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 [&::-webkit-scrollbar-button]:hidden">
          {!showQR ? (
            <>
              {/* Input de número de personas con botones +/- */}
              <div>
                <label className="block mb-3 text-sm font-medium text-[#334155]">
                  ¿Cuántas personas hay en la mesa?
                </label>
                <div className="flex items-center gap-3">
                  {/* Botón decrementar */}
                  <button
                    type="button"
                    onClick={() =>
                      setNumPersonas((prev) => Math.max(1, prev - 1))
                    }
                    disabled={numPersonas <= 1}
                    className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E2E8F0] disabled:hover:text-[#64748B] transition-colors"
                  >
                    <Minus size={20} />
                  </button>

                  {/* Input numérico editable */}
                  <input
                    type="number"
                    min="1"
                    max={isAltProps(props) ? 99 : props.mesa.capacidad}
                    value={numPersonas}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const maxCapacity = isAltProps(props)
                        ? 99
                        : props.mesa.capacidad;
                      setNumPersonas(Math.min(Math.max(1, value), maxCapacity));
                    }}
                    className="flex-1 px-4 py-3 border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] text-center text-2xl font-semibold text-[#334155] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {/* Botón incrementar */}
                  <button
                    type="button"
                    onClick={() => {
                      const maxCapacity = isAltProps(props)
                        ? 99
                        : props.mesa.capacidad;
                      setNumPersonas((prev) => Math.min(prev + 1, maxCapacity));
                    }}
                    disabled={
                      numPersonas >=
                      (isAltProps(props) ? 99 : props.mesa.capacidad)
                    }
                    className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E2E8F0] disabled:hover:text-[#64748B] transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#94A3B8] text-center">
                  Capacidad máxima:{' '}
                  {isAltProps(props) ? 'N/A' : props.mesa.capacidad} personas
                </p>
              </div>

              {/* Botón generar */}
              <PrimaryButton onClick={generateQRCode} className="w-full">
                Generar QR
              </PrimaryButton>
            </>
          ) : (
            <>
              {/* QR Image */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl border-2 border-[#E2E8F0]">
                  {qrCode ? (
                    <ImageWithFallback
                      src={qrImageUrl}
                      alt={`QR Code for ${mesaNombre}`}
                      className="w-72 h-72"
                    />
                  ) : (
                    <div className="w-72 h-72 bg-[#F1F5F9] animate-pulse rounded-lg"></div>
                  )}
                </div>
              </div>

              {/* Info de personas */}
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">{numPersonas}</span>{' '}
                  {numPersonas === 1 ? 'persona' : 'personas'} en la mesa
                </p>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Este QR no expira.</span> El
                  tiempo se gestiona automáticamente según el estado del pedido.
                </p>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Muéstrale este código al cliente para que lo escanee con su
                  teléfono. El cliente podrá acceder al menú y hacer su pedido
                  directamente.
                </p>
              </div>

              {/* Code Text */}
              <div>
                <label className="block mb-1.5 text-sm text-[#64748B]">
                  Código:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrCodeShort}
                    readOnly
                    className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#334155]"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    title="Copiar código"
                  >
                    {copied ? (
                      <Check size={20} className="text-[#22C55E]" />
                    ) : (
                      <Copy size={20} className="text-[#64748B]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <PrimaryButton onClick={onClose} className="w-full">
                Cerrar
              </PrimaryButton>
            </>
          )}
        </div>
        {/* End Content */}
      </div>
    </div>
  );
}
