import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Mail, CheckCircle } from "lucide-react";

export function LoginScreen({ onLogin, onCreateAccount }: { onLogin: () => void; onCreateAccount: () => void }) {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSendRecoveryEmail = () => {
    if (!recoveryEmail) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      toast.error("Por favor ingresa un correo válido");
      return;
    }

    // Simular envío de correo
    setIsEmailSent(true);
    toast.success("¡Correo de recuperación enviado!");
    
    // Resetear después de 3 segundos
    setTimeout(() => {
      setIsForgotPasswordOpen(false);
      setIsEmailSent(false);
      setRecoveryEmail("");
    }, 3000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <Logo size={140} />
            <h1 className="mt-6 text-slate-800">ReservaYa</h1>
            <p className="text-slate-600 mt-2 text-center">
              Encuentra y reserva tu mesa favorita
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-12 bg-orange-50/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-12 bg-orange-50/30"
              />
            </div>

            <button 
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-orange-600 hover:text-orange-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>

            <Button
              onClick={onLogin}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all duration-300 hover:shadow-xl"
            >
              Iniciar Sesión
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-orange-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-slate-500">o</span>
              </div>
            </div>

            <Button
              onClick={onCreateAccount}
              variant="outline"
              className="w-full h-12 border-2 border-orange-300 text-slate-700 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Crear Nueva Cuenta
            </Button>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="bg-white border-4 border-orange-200 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              {isEmailSent ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  ¡Correo Enviado!
                </>
              ) : (
                <>
                  <Mail className="h-6 w-6 text-orange-600" />
                  Recuperar Contraseña
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {isEmailSent
                ? "Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu cuenta."
                : "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."}
            </DialogDescription>
          </DialogHeader>

          {!isEmailSent ? (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-slate-700">
                  Correo Electrónico
                </Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendRecoveryEmail()}
                  className="border-2 border-orange-200 focus:border-orange-400 rounded-xl h-12 bg-orange-50/30"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setRecoveryEmail("");
                  }}
                  variant="outline"
                  className="flex-1 h-11 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendRecoveryEmail}
                  className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
                >
                  Enviar Correo
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-700 mb-1">
                    Correo enviado a <span className="text-green-700">{recoveryEmail}</span>
                  </p>
                  <p className="text-slate-600">
                    Si no lo ves, revisa tu carpeta de spam.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
