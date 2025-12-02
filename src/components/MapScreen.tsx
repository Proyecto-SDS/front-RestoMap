import { MapPin, Search, Star, Clock, UtensilsCrossed, Heart } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { UserMenu } from "./UserMenu";
import Map, { Marker, Popup } from 'react-map-gl';
import { useState, useMemo } from 'react'; // Re-agregado useMemo


// Re-agregado: Definiciones de filtro
type RestaurantType = "Todos" | "Restaurante" | "Restobar" | "Cafetería";
const filterTypes: RestaurantType[] = ["Todos", "Restaurante", "Restobar", "Cafetería"];

interface Restaurant {
  id: number;
  name: string;
  type: string;
  rating: number;
  hours: string;
  distance: string;
  position: { top: string; left: string };
  coordinates: [number, number]; // [longitude, latitude]
}

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "King Halo",
    type: "Restaurante",
    rating: 4.8,
    hours: "11:00 AM - 10:00 PM",
    distance: "0.5 km",
    position: { top: "45%", left: "48%" },
    coordinates: [-77.0428, -12.0464], // Lima, Perú
  },
  {
    id: 2,
    name: "La Paella Real",
    type: "Restobar",
    rating: 4.6,
    hours: "12:00 PM - 11:00 PM",
    distance: "1.2 km",
    position: { top: "32%", left: "62%" },
    coordinates: [-77.0328, -12.0364], 
  },
  {
    id: 3,
    name: "Café del Mar",
    type: "Cafetería",
    rating: 4.9,
    hours: "8:00 AM - 8:00 PM",
    distance: "0.8 km",
    position: { top: "58%", left: "38%" },
    coordinates: [-77.0528, -12.0564],
  },
];

export function MapScreen({
  selectedRestaurant,
  onSelectRestaurant,
  onViewDetails,
  onViewFavorites,
  onViewReservations,
  onStartLogin, // NUEVO PROP
  onCreateAccount, // NUEVO PROP
  favorites,
  onToggleFavorite,
}: {
  selectedRestaurant: number | null;
  onSelectRestaurant: (id: number | null) => void;
  onViewDetails: () => void;
  onViewFavorites: () => void;
  onViewReservations: () => void;
  onStartLogin: () => void; // NUEVO TIPO
  onCreateAccount: () => void; // NUEVO TIPO
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  const selected = restaurants.find((r) => r.id === selectedRestaurant);
  const [popupInfo, setPopupInfo] = useState<Restaurant | null>(null);

  // Re-agregado: Estado y lógica de filtro
  const [selectedFilter, setSelectedFilter] = useState<RestaurantType>("Todos");

  const filteredRestaurants = useMemo(() => {
    if (selectedFilter === "Todos") {
      return restaurants;
    }
    return restaurants.filter(
      (restaurant) => restaurant.type === selectedFilter,
    );
  }, [selectedFilter]);

 const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">ReservaYa</h2>
          <UserMenu 
            onViewFavorites={onViewFavorites} 
            onViewReservations={onViewReservations}
            onStartLogin={onStartLogin} // Se pasa la nueva función
            onCreateAccount={onCreateAccount} // Se pasa la nueva función
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar restaurantes, cafeterías..."
            className="pl-12 h-12 bg-white border-0 rounded-xl shadow-md"
          />
        </div>

        {/* Re-agregado: Filtros de Categoría */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {filterTypes.map((type) => (
                <Badge
                    key={type}
                    onClick={() => {
                        setSelectedFilter(type);
                        onSelectRestaurant(null); 
                    }}
                    className={`cursor-pointer px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                        selectedFilter === type 
                            ? "bg-white text-orange-600 border border-white shadow-inner" 
                            : "bg-white/20 text-white border border-white/50 hover:bg-white/40"
                    }`}
                >
                    {type}
                </Badge>
            ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[calc(100vh-180px)]">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: -77.0428,
            latitude: -12.0464,
            zoom: 13
          }}
          style={{width: '100%', height: '100%'}}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {filteredRestaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              longitude={restaurant.coordinates[0]}
              latitude={restaurant.coordinates[1]}
              anchor="bottom"
            >
              <button
                onClick={() => {
                  onSelectRestaurant(
                    selectedRestaurant === restaurant.id ? null : restaurant.id
                  );
                  setPopupInfo(restaurant);
                }}
                className="transition-all duration-300 hover:scale-110"
              >
                <div
                  className={`relative ${
                    selectedRestaurant === restaurant.id ? "scale-125" : ""
                  } transition-transform duration-300`}
                >
                  <MapPin
                    className={`h-12 w-12 ${
                      selectedRestaurant === restaurant.id
                        ? "fill-orange-500 text-orange-600"
                        : "fill-red-500 text-red-600"
                    } drop-shadow-lg`}
                  />
                  <UtensilsCrossed className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-5 text-white" />
                </div>
              </button>
            </Marker>
          ))}

          {popupInfo && (
            <Popup
              longitude={popupInfo.coordinates[0]}
              latitude={popupInfo.coordinates[1]}
              anchor="top"
              onClose={() => setPopupInfo(null)}
              closeButton={false}
              className="restaurant-popup"
            >
              <div className="p-2">
                <h3 className="font-bold text-sm">{popupInfo.name}</h3>
                <p className="text-xs text-slate-600">{popupInfo.type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{popupInfo.rating}</span>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Info Card */}
        {selected && (
          <div className="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="bg-white border-4 border-orange-200 shadow-2xl rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-slate-800 mb-1">{selected.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white border-0">
                        {selected.type}
                      </Badge>
                      <span className="text-slate-500">• {selected.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(selected.id)}
                      className={`p-2 rounded-full transition-all ${
                        favorites.includes(selected.id)
                          ? "text-red-500 hover:bg-red-50"
                          : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          favorites.includes(selected.id) ? "fill-red-500" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onSelectRestaurant(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-700">{selected.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{selected.hours}</span>
                  </div>
                </div>

                <Button
                  onClick={onViewDetails}
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
                >
                  Ver Menú y Reservar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom indicator */}
      <div className="bg-white px-6 py-3 flex items-center justify-center gap-2 border-t-2 border-orange-100">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-slate-600">
          {filteredRestaurants.length} restaurantes cerca de ti
        </span>
      </div>
    </div>
  );
}