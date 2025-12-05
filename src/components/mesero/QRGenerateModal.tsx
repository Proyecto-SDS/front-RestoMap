import { Check, Copy, Download, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
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

  const [qrCode, setQrCode] = useState(() => initialQrUrl || '');
  const [qrExpiration, setQrExpiration] = useState(30); // minutes
  const [copied, setCopied] = useState(false);
  const hasGenerated = useRef(false);

  const generateQRCode = useCallback(async () => {
    if (initialQrUrl) {
      setQrCode(initialQrUrl);
      return;
    }
    // Mock API call - POST /api/qr-dinamico/generar-mesa
    await new Promise((resolve) => setTimeout(resolve, 500));
    const code = `QR-MESA-${mesaId}-${Date.now()}`;
    setQrCode(code);
    setQrExpiration(30);
  }, [mesaId, initialQrUrl]);

  // Generar QR solo si no hay uno inicial - se ejecuta una vez al montar
  useEffect(() => {
    if (isOpen && !initialQrUrl && !hasGenerated.current) {
      hasGenerated.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void generateQRCode();
    }
  }, [isOpen, initialQrUrl, generateQRCode]);

  useEffect(() => {
    // Countdown timer
    if (qrExpiration > 0 && isOpen) {
      const timer = setInterval(() => {
        setQrExpiration((prev) => Math.max(0, prev - 1));
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [qrExpiration, isOpen]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // Mock download - in production, generate actual QR image
    alert('Descargando codigo QR como PNG...');
  };

  const handleRegenerateQR = async () => {
    await generateQRCode();
  };

  if (!isOpen) return null;

  // Generate QR Code using an API or library
  // For demo, we'll use a placeholder with QRCode.js or similar
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrCode
  )}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl text-[#334155]">Codigo QR Generado</h2>
            <p className="text-sm text-[#94A3B8]">{mesaNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="p-6 space-y-6">
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

          {/* Expiration Timer */}
          <div className="text-center">
            <p className="text-sm text-[#64748B] mb-1">Expira en:</p>
            <p className="text-2xl text-[#F97316]">{qrExpiration} minutos</p>
            {qrExpiration === 0 && (
              <p className="text-xs text-[#EF4444] mt-1">
                Codigo expirado - Genera uno nuevo
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Muestrale este codigo al cliente para que lo escanee con su
              telefono. El cliente podra acceder al menu y hacer su pedido
              directamente.
            </p>
          </div>

          {/* Code Text */}
          <div>
            <label className="block mb-1.5 text-sm text-[#64748B]">
              Codigo:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrCode}
                readOnly
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm text-[#334155]"
              />
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                title="Copiar codigo"
              >
                {copied ? (
                  <Check size={20} className="text-[#22C55E]" />
                ) : (
                  <Copy size={20} className="text-[#64748B]" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <SecondaryButton onClick={handleDownloadQR} className="flex-1">
              <Download size={16} />
              Descargar QR
            </SecondaryButton>
            <SecondaryButton onClick={handleRegenerateQR} className="flex-1">
              <RefreshCw size={16} />
              Generar Nuevo
            </SecondaryButton>
          </div>

          {/* Close Button */}
          <PrimaryButton onClick={onClose} className="w-full">
            Cerrar
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
