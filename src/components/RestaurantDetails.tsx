import { ArrowLeft, Star, Clock, MapPin, Users, Plus, Minus, ShoppingCart, QrCode } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { ImageWithFallback } from "./modelofigm/ImageWithFallback";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Paella Valenciana",
    description: "Arroz con mariscos frescos, azafrán y vegetales",
    price: 45.00,
    category: "Platos Principales",
    image: "paella seafood",
  },
  {
    id: 2,
    name: "Cerveza Artesanal",
    description: "Cerveza local IPA 500ml",
    price: 12.00,
    category: "Bebidas",
    image: "craft beer glass",
  },
  {
    id: 3,
    name: "Tabla de Mariscos",
    description: "Variedad de mariscos frescos para compartir",
    price: 38.00,
    category: "Entradas",
    image: "seafood platter",
  },
  {
    id: 4,
    name: "Pulpo a la Gallega",
    description: "Pulpo tierno con papas y pimentón",
    price: 32.00,
    category: "Platos Principales",
    image: "octopus dish",
  },
];

interface ReservationData {
  restaurantName: string;
  time: string;
  guests: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export function RestaurantDetails({ 
  onBack, 
  onShowQR 
}: { 
  onBack: () => void; 
  onShowQR: (reservationData: ReservationData) => void;
}) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [guests, setGuests] = useState(2);

  const addToCart = (itemId: number) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((i) => i.id === Number(id));
    return sum + (item?.price || 0) * qty;
  }, 0);

  const availableTimes = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

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
          <div className="flex-1">
            <h2 className="text-white">King Halo</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                <span className="text-white/90">4.8</span>
              </div>
              <span className="text-white/70">•</span>
              <span className="text-white/90">Restaurante</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pb-32">
        {/* Restaurant Info */}
        <Card className="mb-6 border-2 border-orange-200 rounded-2xl overflow-hidden">
          <div className="p-5 bg-white">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700">11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span className="text-slate-700">Av. Principal 123, Centro</span>
                </div>
              </div>
            </div>

            <Separator className="my-4 bg-orange-100" />

            {/* Reservation Section */}
            <div className="space-y-4">
              <h3 className="text-slate-800">Reserva tu mesa</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 mb-2 block">Personas</label>
                  <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="h-8 w-8 rounded-lg hover:bg-orange-200"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-slate-800">{guests}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setGuests(guests + 1)}
                      className="h-8 w-8 rounded-lg hover:bg-orange-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 mb-2 block">Hora</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-12 px-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                  >
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu */}
        <div className="mb-4">
          <h3 className="text-slate-800 mb-4">Pre-ordena tu comida</h3>
          <p className="text-slate-600 mb-6">
            Selecciona tus platos ahora y estarán listos cuando llegues
          </p>
        </div>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="border-2 border-orange-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4 p-4 bg-white">
                <ImageWithFallback
                  src=""
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover bg-gradient-to-br from-orange-200 to-red-200"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-slate-800 mb-1">{item.name}</h4>
                      <Badge
                        variant="outline"
                        className="border-orange-300 text-orange-700 bg-orange-50"
                      >
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600">S/ {item.price.toFixed(2)}</span>
                    {cart[item.id] ? (
                      <div className="flex items-center gap-2 bg-orange-100 rounded-lg px-2 py-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-7 w-7 hover:bg-orange-200 rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-slate-800 min-w-[20px] text-center">
                          {cart[item.id]}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => addToCart(item.id)}
                          className="h-7 w-7 hover:bg-orange-200 rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg h-8"
                      >
                        Agregar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-300 shadow-2xl p-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <span className="text-slate-600">{totalItems} items</span>
              </div>
              <div className="text-slate-800">
                Total: <span className="text-orange-600">S/ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                const items = Object.entries(cart).map(([id, qty]) => {
                  const item = menuItems.find((i) => i.id === Number(id))!;
                  return {
                    name: item.name,
                    quantity: qty,
                    price: item.price,
                  };
                });
                
                onShowQR({
                  restaurantName: "King Halo",
                  time: selectedTime,
                  guests: guests,
                  items: items,
                  total: totalPrice,
                });
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 px-8 shadow-lg"
            >
              Confirmar Reserva
            </Button>
          </div>
          <p className="text-slate-500 text-center">
            Reserva para {guests} {guests === 1 ? "persona" : "personas"} a las {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
}
