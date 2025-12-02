import { ArrowLeft, Star, Clock, MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface FavoriteRestaurant {
  id: number;
  name: string;
  type: string;
  rating: number;
  hours: string;
  distance: string;
  address: string;
}

export function FavoritesScreen({ 
  onBack, 
  onSelectRestaurant, 
  favorites,
  onToggleFavorite 
}: { 
  onBack: () => void; 
  onSelectRestaurant: (id: number) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  // Base de datos de todos los restaurantes
  const allRestaurants: FavoriteRestaurant[] = [
    {
      id: 1,
      name: "King Halo",
      type: "Restaurante",
      rating: 4.8,
      hours: "11:00 AM - 10:00 PM",
      distance: "0.5 km",
      address: "Av. Principal 123, Centro",
    },
    {
      id: 2,
      name: "La Paella Real",
      type: "Restobar",
      rating: 4.6,
      hours: "12:00 PM - 11:00 PM",
      distance: "1.2 km",
      address: "Calle Los Sabores 456",
    },
    {
      id: 3,
      name: "Café del Mar",
      type: "Cafetería",
      rating: 4.9,
      hours: "8:00 AM - 8:00 PM",
      distance: "0.8 km",
      address: "Malecón Costa Verde 789",
    },
  ];

  // Filtrar solo los restaurantes que están en favoritos
  const favoriteRestaurants = allRestaurants.filter((restaurant) =>
    favorites.includes(restaurant.id)
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 shadow-lg sticky top-0 z-50">
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
            <h2 className="text-white">Mis Favoritos</h2>
            <p className="text-white/90 mt-1">{favoriteRestaurants.length} restaurantes guardados</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {favoriteRestaurants.length > 0 ? (
          <div className="space-y-4">
            {favoriteRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="border-2 border-orange-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-orange-300"
              >
                <div className="p-5 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-slate-800">{restaurant.name}</h3>
                        <button 
                          onClick={() => onToggleFavorite(restaurant.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Heart className="h-5 w-5 fill-red-500" />
                        </button>
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white border-0">
                        {restaurant.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-slate-700">{restaurant.rating}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{restaurant.distance}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{restaurant.hours}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>{restaurant.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        onBack();
                        // Aquí se podría navegar al mapa con el restaurante seleccionado
                      }}
                      variant="outline"
                      className="h-10 border-2 border-orange-300 text-slate-700 rounded-xl hover:bg-orange-50"
                    >
                      Ver en Mapa
                    </Button>
                    <Button
                      onClick={() => onSelectRestaurant(restaurant.id)}
                      className="h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl"
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-orange-400" />
            </div>
            <h3 className="text-slate-800 mb-2">No tienes favoritos</h3>
            <p className="text-slate-600 text-center mb-6 max-w-xs">
              Guarda tus restaurantes favoritos para acceder rápidamente a ellos
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl px-8"
            >
              Explorar Restaurantes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
