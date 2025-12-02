import { NextRequest, NextResponse } from "next/server";

// Simulación de autenticación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Simulación básica de autenticación
    if (email && password) {
      return NextResponse.json({
        success: true,
        user: {
          id: "1",
          email,
          name: "Usuario Demo",
        },
        token: "demo-token-" + Date.now(),
      });
    }
    
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error en la autenticación" },
      { status: 400 }
    );
  }
}
