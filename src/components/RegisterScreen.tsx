import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export function RegisterScreen({ onRegister, onBackToLogin }: { onRegister: () => void; onBackToLogin: () => void }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    
    // Validar contraseña
    if (value.length > 0 && value.length < 8) {
      setErrors({ ...errors, password: "Mínimo 8 caracteres" });
    } else {
      setErrors({ ...errors, password: "" });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData({ ...formData, confirmPassword: value });
    
    // Validar que coincidan
    if (value.length > 0 && value !== formData.password) {
      setErrors({ ...errors, confirmPassword: "Las contraseñas no coinciden" });
    } else {
      setErrors({ ...errors, confirmPassword: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar antes de enviar
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Las contraseñas no coinciden" });
      return;
    }
    
    if (formData.password.length < 8) {
      setErrors({ ...errors, password: "Mínimo 8 caracteres" });
      return;
    }
    
    // Si todo está bien, registrar
    onRegister();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
          {/* Back Button */}
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>

          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <Logo size={100} />
            <h2 className="mt-4 text-slate-800">Crear Cuenta</h2>
            <p className="text-slate-600 mt-2 text-center">
              Únete a ReservaYa
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-slate-700">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-11 bg-orange-50/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-slate-700">
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  type="text"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-11 bg-orange-50/30"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-11 bg-orange-50/30"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-slate-700">
                Teléfono
              </Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+51 999 999 999"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
                className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-11 bg-orange-50/30"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className={`border-2 ${
                  errors.password ? "border-red-400" : "border-orange-200"
                } focus:border-orange-400 rounded-xl h-11 bg-orange-50/30`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
              <p className="text-slate-500 text-sm">Mínimo 8 caracteres</p>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
                className={`border-2 ${
                  errors.confirmPassword ? "border-red-400" : "border-orange-200"
                } focus:border-orange-400 rounded-xl h-11 bg-orange-50/30`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-sm">✓ Las contraseñas coinciden</p>
              )}
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-2 border-orange-300 text-orange-500 focus:ring-orange-400"
              />
              <label htmlFor="terms" className="text-slate-600 text-sm">
                Acepto los{" "}
                <button type="button" className="text-orange-600 hover:text-orange-700">
                  términos y condiciones
                </button>{" "}
                y la{" "}
                <button type="button" className="text-orange-600 hover:text-orange-700">
                  política de privacidad
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all duration-300 hover:shadow-xl mt-6"
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Ya tienes cuenta */}
          <div className="mt-6 text-center">
            <span className="text-slate-600">¿Ya tienes cuenta? </span>
            <button
              onClick={onBackToLogin}
              className="text-orange-600 hover:text-orange-700 transition-colors"
            >
              Inicia Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
