import { NextRequest, NextResponse } from "next/server";

// Simulación de base de datos de reservas
let reservations: any[] = [];

export async function GET() {
  return NextResponse.json(reservations);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newReservation = {
      id: Date.now().toString(),
      ...body,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    
    reservations.push(newReservation);
    
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    const index = reservations.findIndex((r) => r.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }
    
    reservations[index] = {
      ...reservations[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(reservations[index]);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 400 }
    );
  }
}
