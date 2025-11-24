import { NextResponse } from "next/server";

// Simulación de datos de restaurantes
const restaurants = [
  {
    id: 1,
    name: "King Halo",
    type: "Restaurante",
    rating: 4.8,
    hours: "11:00 AM - 10:00 PM",
    distance: "0.5 km",
    coordinates: [-77.0428, -12.0464],
  },
  {
    id: 2,
    name: "La Paella Real",
    type: "Restobar",
    rating: 4.6,
    hours: "12:00 PM - 11:00 PM",
    distance: "1.2 km",
    coordinates: [-77.0328, -12.0364],
  },
  {
    id: 3,
    name: "Café del Mar",
    type: "Cafetería",
    rating: 4.7,
    hours: "7:00 AM - 8:00 PM",
    distance: "0.8 km",
    coordinates: [-77.0528, -12.0564],
  },
];

export async function GET() {
  return NextResponse.json(restaurants);
}
