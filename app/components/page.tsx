import React from "react";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import MapMarkerIcon from "../components/MapMarkerIcon";

export default function ForgotPasswordPage() {
  return (
    <main className="register-page">
      <div className="register-card">
        <div className="card-top">
          <MapMarkerIcon />
          <h2>Recuperar Contraseña</h2>
          <p className="subtitle">Ingresa tu correo para continuar</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
