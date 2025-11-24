"use client";
import React, { useState } from "react";
import Link from "next/link";

type FormState = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Ingresa tu correo";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Correo inválido";
    if (!form.password) errs.password = "Ingresa una contraseña";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenciales incorrectas.");
      }

      alert("¡Inicio de sesión exitoso!");
      // Opcional: Redirigir al usuario a su dashboard.
      // window.location.href = '/dashboard';
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <label>Correo Electrónico</label>
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        className="form-input"
      />
      {errors.email && <small className="error">{errors.email}</small>}

      <label>Contraseña</label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        className="form-input"
      />
      {errors.password && <small className="error">{errors.password}</small>}

      <div className="text-right">
        <Link href="#" className="link">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {apiError && <div className="error api-error">{apiError}</div>}

      <button className="btn-gradient" type="submit" disabled={loading}>
        {loading ? "Iniciando..." : "Iniciar Sesión"}
      </button>
      <div className="signin-link">
        ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
      </div>
    </form>
  );
}
