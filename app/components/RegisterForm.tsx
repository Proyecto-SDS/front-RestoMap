"use client";
import React, { useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export default function RegisterForm() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Ingresa tu nombre";
    if (!form.lastName.trim()) errs.lastName = "Ingresa tu apellido";
    if (!form.email.trim()) errs.email = "Ingresa tu correo";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Correo inválido";
    if (!form.phone.trim()) errs.phone = "Ingresa tu teléfono";
    if (!form.password) errs.password = "Ingresa una contraseña";
    else if (form.password.length < 8) errs.password = "Mínimo 8 caracteres";
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = "No coincide";
    if (!form.terms) errs.terms = "Debes aceptar los términos";
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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la cuenta.");
      }

      alert("¡Registro exitoso!");
      // Opcional: Redirigir al usuario, por ejemplo a la página de login.
      // window.location.href = '/login';
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row two">
        <div>
          <label>Nombre</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.firstName && (
            <small className="error">{errors.firstName}</small>
          )}
        </div>
        <div>
          <label>Apellido</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.lastName && (
            <small className="error">{errors.lastName}</small>
          )}
        </div>
      </div>

      <label>Correo Electrónico</label>
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        className="form-input"
      />
      {errors.email && <small className="error">{errors.email}</small>}

      <label>Teléfono</label>
      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        className="form-input"
      />
      {errors.phone && <small className="error">{errors.phone}</small>}

      <label>Contraseña</label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        className="form-input"
      />
      <small className="muted">Mínimo 8 caracteres</small>
      {errors.password && <small className="error">{errors.password}</small>}

      <label>Confirmar Contraseña</label>
      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        className="form-input"
      />
      {errors.confirmPassword && (
        <small className="error">{errors.confirmPassword}</small>
      )}

      <label className="checkbox-row">
        <input
          type="checkbox"
          name="terms"
          checked={form.terms}
          onChange={handleChange}
        />
        <span>
          Acepto los{" "}
          <a href="#" className="link">
            términos y condiciones
          </a>{" "}
          y la{" "}
          <a href="#" className="link">
            política de privacidad
          </a>
        </span>
      </label>
      {errors.terms && <small className="error">{errors.terms}</small>}

      {apiError && <div className="error api-error">{apiError}</div>}

      <button className="btn-gradient" type="submit" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear Cuenta"}
      </button>
      <div className="signin-link">
        ¿Ya tienes cuenta? <a href="/login">Inicia Sesión</a>
      </div>
    </form>
  );
}
