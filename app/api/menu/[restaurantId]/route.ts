import { NextRequest, NextResponse } from "next/server";

const menuItems = [
  {
    id: 1,
    name: "Paella Valenciana",
    description: "Arroz con mariscos frescos, azafrán y vegetales",
    price: 45.0,
    category: "Platos Principales",
    image: "paella seafood",
  },
  {
    id: 2,
    name: "Cerveza Artesanal",
    description: "Cerveza local IPA 500ml",
    price: 12.0,
    category: "Bebidas",
    image: "craft beer glass",
  },
  {
    id: 3,
    name: "Tabla de Mariscos",
    description: "Variedad de mariscos frescos para compartir",
    price: 38.0,
    category: "Entradas",
    image: "seafood platter",
  },
  {
    id: 4,
    name: "Pulpo a la Gallega",
    description: "Pulpo tierno con papas y pimentón",
    price: 32.0,
    category: "Platos Principales",
    image: "octopus dish",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  // En una aplicación real, filtrarías por restaurantId
  return NextResponse.json(menuItems);
}
