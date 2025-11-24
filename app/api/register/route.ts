import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    // Here you would typically add logic to create a new user in your database.
    // For this example, we'll just log the data and return a success response.
    console.log("New user registration:", { firstName, lastName, email, phone });

    // Simulate a successful registration
    return NextResponse.json(
      { message: "¡Registro exitoso!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Error al crear la cuenta." },
      { status: 500 }
    );
  }
}
