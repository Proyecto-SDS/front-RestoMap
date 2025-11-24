import { NextRequest, NextResponse } from "next/server";

// Simulación de registro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // Validación básica
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }
    
    // Simulación de registro exitoso
    return NextResponse.json(
      {
        success: true,
        user: {
          id: Date.now().toString(),
          email,
          name,
        },
        token: "demo-token-" + Date.now(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error en el registro" },
      { status: 400 }
    );
  }
}
