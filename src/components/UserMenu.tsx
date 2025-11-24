import { User, Heart, Settings, Calendar, LogIn, UserPlus } from "lucide-react"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface UserMenuProps {
  onViewFavorites: () => void; 
  onViewReservations: () => void;
  onStartLogin: () => void; // NUEVA PROP
  onCreateAccount: () => void; // NUEVA PROP
}

export function UserMenu({ 
    onStartLogin, 
    onCreateAccount 
}: UserMenuProps) {

  // Las props onViewFavorites y onViewReservations no se utilizan en esta vista de "no logeado", 
  // pero se mantienen en la interfaz ya que las reciben de MapScreen.

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      {/* Se agrega flex flex-col para forzar la versión al final de la hoja */}
      <SheetContent className="bg-white border-l-4 border-orange-300 w-[300px] sm:w-[350px] flex flex-col">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-4 mt-2">
            <Avatar className="h-16 w-16 border-4 border-orange-200">
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white">
                <User className="h-8 w-8" /> 
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-slate-800 text-xl font-bold">¡Bienvenido!</SheetTitle>
              <SheetDescription className="text-slate-600 mt-1">
                Inicia sesión para acceder a todas las funciones
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-3">
          {/* Botón Iniciar Sesión (Diseño exacto de la imagen) */}
          <button
            onClick={onStartLogin}
            className="w-full p-0 overflow-hidden rounded-xl shadow-lg transition-transform duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <LogIn className="h-8 w-8 text-white" />
              <div className="flex-1 text-left">
                <h4 className="text-xl font-bold">Iniciar Sesión</h4>
                <p className="text-sm opacity-90">Accede a tu cuenta</p>
              </div>
            </div>
          </button>

          {/* Botón Crear Cuenta (Diseño exacto de la imagen) */}
          <button
            onClick={onCreateAccount}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors border-2 border-slate-200 hover:bg-slate-50"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-slate-800 font-semibold">Crear Cuenta</h4>
              <p className="text-sm text-slate-500">Regístrate gratis</p>
            </div>
          </button>
        </div>

        {/* Sección "¿Por qué registrarte?" (Diseño exacto de la imagen) */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-bold text-slate-800 mb-3">¿Por qué registrarte?</h4>
            
            <div className="space-y-3 text-slate-700">
                <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Guarda tus favoritos</span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span>Gestiona tus reservas</span>
                </div>
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-blue-500" />
                    <span>Personaliza tu experiencia</span>
                </div>
            </div>
        </div>

        {/* Versión */}
        <div className="mt-auto pt-8 text-center text-slate-400">
            <p className="text-sm">ReservaYa v1.0.0</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}