"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Ingresa tu correo";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Correo inválido";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      // Simulación de llamada a una API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // En una aplicación real, aquí harías la llamada a tu endpoint:
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // if (!response.ok) throw new Error("No se pudo procesar la solicitud.");

      // Por seguridad, siempre muestra un mensaje de éxito para no revelar si un correo está registrado o no.
      setSuccessMessage(
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
    } catch (err: any) {
      setError("Ocurrió un error. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      {successMessage ? (
        <div className="success-message">{successMessage}</div>
      ) : (
        <>
          <label>Correo Electrónico</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
          {error && <small className="error">{error}</small>}
          <button className="btn-gradient" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </>
      )}
      <div className="signin-link">
        <Link href="/login">Volver a Iniciar Sesión</Link>
      </div>
    </form>
  );
}
