"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!password) {
      errs.password = "Ingresa una nueva contraseña";
    } else if (password.length < 8) {
      errs.password = "La contraseña debe tener al menos 8 caracteres";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Simulación de llamada a una API para restablecer la contraseña
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // En una aplicación real, aquí harías la llamada a tu endpoint:
      // const response = await fetch('/api/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password }),
      // });
      // if (!response.ok) throw new Error("El enlace ha expirado o es inválido.");

      setSuccessMessage("¡Tu contraseña ha sido restablecida con éxito!");
    } catch (err: any) {
      setApiError(err.message || "Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="text-center">
        <div className="success-message">{successMessage}</div>
        <Link href="/login" className="link">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <label>Nueva Contraseña</label>
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="form-input"
      />
      {errors.password && <small className="error">{errors.password}</small>}

      <label>Confirmar Nueva Contraseña</label>
      <input
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="form-input"
      />
      {errors.confirmPassword && (
        <small className="error">{errors.confirmPassword}</small>
      )}

      {apiError && <div className="error api-error">{apiError}</div>}

      <button className="btn-gradient" type="submit" disabled={loading}>
        {loading ? "Restableciendo..." : "Restablecer Contraseña"}
      </button>
    </form>
  );
}
