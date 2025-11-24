"use client";

import { useState } from "react";
import { MapScreen } from "@/components/MapScreen";
import { RestaurantDetails } from "@/components/RestaurantDetails";
import { QRConfirmation } from "@/components/QRConfirmation";
import { FavoritesScreen } from "@/components/FavoritesScreen";
import {
  ReservationsScreen,
  Reservation,
} from "@/components/ReservationsScreen";
import LoginForm from "@/components/LoginForm";
import { RegisterScreen } from "@/components/RegisterScreen";

type Screen =
  | "map"
  | "details"
  | "qr"
  | "favorites"
  | "reservations"
  | "placeholder"
  | "login"
  | "register";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("map");
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(
    null
  );
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentReservationData, setCurrentReservationData] = useState<{
    restaurantName: string;
    time: string;
    guests: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
  } | null>(null);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const saveReservation = () => {
    if (currentReservationData) {
      const newReservation: Reservation = {
        id: Date.now().toString(),
        restaurantName: currentReservationData.restaurantName,
        date: "Hoy",
        time: currentReservationData.time,
        guests: currentReservationData.guests,
        items: currentReservationData.items,
        total: currentReservationData.total,
        status: "confirmed",
      };
      setReservations((prev) => [newReservation, ...prev]);
      setCurrentReservationData(null);
    }
  };

  return (
    <div className="">
      {currentScreen === "placeholder" && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <div className="text-8xl mb-4 text-orange-400">🚧</div>
          <h1 className="text-2xl font-bold mb-4 text-slate-700">
            ¡Vista en Desarrollo!
          </h1>
          <p className="mb-8">
            Esta funcionalidad está siendo implementada por otro equipo. Por
            favor, vuelve más tarde.
          </p>
          <button
            onClick={() => setCurrentScreen("map")}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-colors"
          >
            Volver al Mapa Principal
          </button>
        </div>
      )}

      {currentScreen === "map" && (
        <MapScreen
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={(id) => {
            setSelectedRestaurant(id);
            // [CORRECCIÓN CRÍTICA]: Solo navegamos a 'details' si 'id' es válido (al hacer clic en un marcador).
            // Si 'id' es null (al hacer clic en un filtro), el screen permanece en 'map'.
            if (id !== null) {
              setCurrentScreen("details");
            }
          }}
          onViewDetails={() => setCurrentScreen("details")}
          onViewFavorites={() => setCurrentScreen("favorites")}
          onViewReservations={() => setCurrentScreen("reservations")}
          onStartLogin={() => setCurrentScreen("login")}
          onCreateAccount={() => setCurrentScreen("register")}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {currentScreen === "details" && selectedRestaurant !== null && (
        <RestaurantDetails
          onBack={() => setCurrentScreen("map")}
          onShowQR={(data: {
            restaurantName: string;
            time: string;
            guests: number;
            items: Array<{ name: string; quantity: number; price: number }>;
            total: number;
          }) => {
            setCurrentReservationData(data);
            setCurrentScreen("qr");
          }}
        />
      )}

      {currentScreen === "qr" && currentReservationData && (
        <QRConfirmation
          reservationData={currentReservationData}
          onBackToMap={() => {
            saveReservation();
            setCurrentScreen("map");
          }}
        />
      )}

      {currentScreen === "favorites" && (
        <FavoritesScreen
          favorites={favorites}
          onBack={() => setCurrentScreen("map")}
          onSelectRestaurant={(id) => {
            setSelectedRestaurant(id);
            setCurrentScreen("details");
          }}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {currentScreen === "reservations" && (
        <ReservationsScreen
          reservations={reservations}
          onBack={() => setCurrentScreen("map")}
        />
      )}

      {currentScreen === "login" && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <LoginForm
            onNavigateToRegister={() => setCurrentScreen("register")}
          />
        </div>
      )}

      {currentScreen === "register" && (
        <RegisterScreen
          onRegister={() => setCurrentScreen("map")}
          onBackToLogin={() => setCurrentScreen("login")}
        />
      )}
    </div>
  );
}
