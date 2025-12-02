import { ArrowLeft, Calendar, Clock, Users, QrCode, UtensilsCrossed, Receipt, Check, Download, X, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState, useRef } from "react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

export interface Reservation {
  id: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: "confirmed" | "completed" | "cancelled";
}

interface ReservationsScreenProps {
  onBack: () => void;
  reservations: Reservation[];
}

export function ReservationsScreen({ onBack, reservations }: ReservationsScreenProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const activeReservations = reservations.filter(r => r.status === "confirmed");
  const pastReservations = reservations.filter(r => r.status !== "confirmed");

  const handleDownloadQR = async () => {
    if (!qrRef.current || !selectedReservation) return;

    try {
      // Get the SVG element
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 1000;
      canvas.height = 1000;

      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Draw QR code centered with padding
        const padding = 100;
        const size = canvas.width - padding * 2;
        ctx.drawImage(img, padding, padding, size, size);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = `reserva-${selectedReservation.id}-qr.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            
            toast.success("Código QR descargado", {
              description: "El código QR se ha guardado en tu dispositivo",
            });
          }
        });

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      toast.error("Error al descargar", {
        description: "No se pudo descargar el código QR",
      });
    }
  };

  const handleShareQR = async () => {
    if (!selectedReservation) return;

    const shareData = {
      title: 'Mi Reserva - ReservaYa',
      text: `Reserva en ${selectedReservation.restaurantName}\nFecha: ${selectedReservation.date} a las ${selectedReservation.time}\nCódigo: ${selectedReservation.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Compartido exitosamente");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Reserva en ${selectedReservation.restaurantName}\nFecha: ${selectedReservation.date} a las ${selectedReservation.time}\nCódigo: ${selectedReservation.id}`
        );
        toast.success("Código copiado", {
          description: "La información se ha copiado al portapapeles",
        });
      }
    } catch (error) {
      toast.error("No se pudo compartir");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-white">Mis Reservas</h2>
            <p className="text-white/80">
              {reservations.length} {reservations.length === 1 ? "reserva" : "reservas"} en total
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Active Reservations */}
        {activeReservations.length > 0 && (
          <div>
            <h3 className="text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Reservas Activas
            </h3>
            <div className="space-y-4">
              {activeReservations.map((reservation) => (
                <Card
                  key={reservation.id}
                  className="border-4 border-green-300 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white">{reservation.restaurantName}</h4>
                      <Badge className="bg-white text-green-700 border-0">
                        Confirmada
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 bg-white space-y-4">
                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl border-2 border-green-200">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <p className="text-slate-600">{reservation.date}</p>
                      </div>

                      <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <p className="text-slate-600">{reservation.time}</p>
                      </div>

                      <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                        <Users className="h-5 w-5 text-purple-600" />
                        <p className="text-slate-600">{reservation.guests} per.</p>
                      </div>
                    </div>

                    {/* Pre-order items */}
                    {reservation.items.length > 0 && (
                      <>
                        <Separator className="bg-green-100" />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                            <p className="text-slate-700">Pre-orden:</p>
                          </div>
                          <div className="space-y-2">
                            {reservation.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-600">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border-2 border-orange-200">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-orange-600" />
                        <span className="text-slate-700">Total</span>
                      </div>
                      <span className="text-orange-600">S/ {reservation.total.toFixed(2)}</span>
                    </div>

                    {/* Show QR Button */}
                    <Button 
                      onClick={() => setSelectedReservation(reservation)}
                      className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
                    >
                      <QrCode className="h-5 w-5 mr-2" />
                      Mostrar Código QR
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Reservations */}
        {pastReservations.length > 0 && (
          <div>
            <h3 className="text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Historial
            </h3>
            <div className="space-y-4">
              {pastReservations.map((reservation) => (
                <Card
                  key={reservation.id}
                  className="border-2 border-slate-200 rounded-2xl overflow-hidden opacity-75"
                >
                  <div className="p-5 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-slate-800 mb-1">{reservation.restaurantName}</h4>
                        <p className="text-slate-600">
                          {reservation.date} • {reservation.time} • {reservation.guests} personas
                        </p>
                      </div>
                      <Badge variant="outline" className="border-slate-300 text-slate-600">
                        {reservation.status === "completed" ? "Completada" : "Cancelada"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total pagado</span>
                      <span>S/ {reservation.total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reservations.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-4">
              <Calendar className="h-12 w-12 text-orange-400" />
            </div>
            <h3 className="text-slate-800 mb-2">No tienes reservas</h3>
            <p className="text-slate-600 mb-6">
              Cuando hagas una reserva, aparecerá aquí
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 px-8"
            >
              Explorar Restaurantes
            </Button>
          </div>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        <DialogContent className="max-w-md border-4 border-green-300 rounded-3xl p-0 gap-0">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-6 text-center relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedReservation(null)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-white mb-2">¡Reserva Confirmada!</DialogTitle>
            <p className="text-green-100">Muestra este código al llegar</p>
          </div>

          {selectedReservation && (
            <div className="p-6 bg-white">
              {/* QR Code */}
              <div className="bg-white border-4 border-green-200 rounded-2xl p-6 mb-6 flex items-center justify-center">
                <div className="relative" ref={qrRef}>
                  <div className="bg-white p-4 rounded-xl">
                    <QRCode
                      value={JSON.stringify({
                        id: selectedReservation.id,
                        restaurant: selectedReservation.restaurantName,
                        date: selectedReservation.date,
                        time: selectedReservation.time,
                        guests: selectedReservation.guests,
                      })}
                      size={192}
                      level="H"
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Reservation Code */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-slate-600 mb-1">Código de Reserva</p>
                <p className="text-orange-600">{selectedReservation.id}</p>
              </div>

              {/* Reservation Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-600">Restaurante</p>
                    <p className="text-slate-800">{selectedReservation.restaurantName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl border-2 border-green-200">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <p className="text-slate-600">{selectedReservation.date}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <p className="text-slate-600">{selectedReservation.time}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <Users className="h-5 w-5 text-purple-600" />
                    <p className="text-slate-600">{selectedReservation.guests} per.</p>
                  </div>
                </div>

                {/* Pre-order items */}
                {selectedReservation.items.length > 0 && (
                  <>
                    <Separator className="bg-green-100" />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                        <p className="text-slate-700">Pre-orden:</p>
                      </div>
                      <div className="space-y-2">
                        {selectedReservation.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-600">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-green-200">
                        <span className="text-slate-800">Total</span>
                        <span className="text-orange-600">S/ {selectedReservation.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleShareQR}
                  variant="outline"
                  className="h-12 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Compartir
                </Button>
                <Button
                  onClick={handleDownloadQR}
                  className="h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
