import { Check, QrCode, Calendar, Clock, Users, UtensilsCrossed } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface ReservationData {
  restaurantName: string;
  time: string;
  guests: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export function QRConfirmation({ 
  reservationData, 
  onBackToMap 
}: { 
  reservationData: ReservationData;
  onBackToMap: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-4 border-green-300 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-white mb-2">¡Reserva Confirmada!</h2>
          <p className="text-green-100">Tu mesa está lista para ti</p>
        </div>

        <div className="p-6 bg-white">
          {/* QR Code */}
          <div className="bg-white border-4 border-green-200 rounded-2xl p-6 mb-6 flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center">
                <QrCode className="h-32 w-32 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-4 mb-6">
            <h3 className="text-slate-800 text-center mb-4">Detalles de tu reserva</h3>

            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-slate-600">Restaurante</p>
                <p className="text-slate-800">{reservationData.restaurantName}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl border-2 border-green-200">
                <Calendar className="h-5 w-5 text-green-600" />
                <p className="text-slate-600">Hoy</p>
              </div>

              <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-slate-600">{reservationData.time}</p>
              </div>

              <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                <Users className="h-5 w-5 text-purple-600" />
                <p className="text-slate-600">{reservationData.guests} per.</p>
              </div>
            </div>

            {/* Pre-order items */}
            {reservationData.items.length > 0 && (
              <>
                <Separator className="bg-green-100" />
                <div>
                  <h4 className="text-slate-800 mb-3">Tu pre-orden:</h4>
                  <div className="space-y-2">
                    {reservationData.items.map((item, idx) => (
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
                    <span className="text-orange-600">S/ {reservationData.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
            <h4 className="text-slate-800 mb-2">Instrucciones:</h4>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Muestra este QR al llegar al restaurante</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Tu pedido comenzará a prepararse automáticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>No necesitas esperar al mesero</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onBackToMap}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
            >
              Volver al Mapa
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 border-2 border-green-300 text-slate-700 rounded-xl hover:bg-green-50"
            >
              Descargar QR
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
