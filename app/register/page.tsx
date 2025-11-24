import React from "react";
import RegisterForm from "../components/RegisterForm";
import MapMarkerIcon from "../components/MapMarkerIcon";

export default function Page() {
  return (
    <main className="register-page">
      <div className="register-card">
        <div className="card-top">
          <MapMarkerIcon />
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Únete a ReservaYa</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
