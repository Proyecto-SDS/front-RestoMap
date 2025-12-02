'use client';

import { useState, useEffect } from 'react';
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  UtensilsCrossed,
  LayoutGrid,
  BarChart3,
  Users,
  Bell,
  TableProperties,
  ClipboardList,
  DollarSign,
  Armchair,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricasView } from '@/components/admin/MetricasView';
import { MenuView } from '@/components/admin/MenuView';
import { PedidosView } from '@/components/admin/PedidosView';
import { MesasView } from '@/components/admin/MesasView';
import { StaffView } from '@/components/admin/StaffView';
import { NotificacionesView } from '@/components/admin/NotificacionesView';
import { useAuth } from '@/context/AuthContext';
import { ReservasView } from '@/components/admin/ReservasView';

type AdminTab =
  | 'dashboard'
  | 'reservas'
  | 'menu'
  | 'pedidos'
  | 'mesas'
  | 'staff'
  | 'metricas';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.email !== 'admin@reservaya.cl') {
      window.location.href = '/';
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservas', label: 'Reservas', icon: CalendarDays },
    { id: 'menu', label: 'Menú', icon: UtensilsCrossed },
    { id: 'pedidos', label: 'Pedidos', icon: LayoutGrid },
    { id: 'mesas', label: 'Mesas', icon: TableProperties },
    { id: 'staff', label: 'Personal', icon: Users },
    { id: 'metricas', label: 'Métricas', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-slate-900 hidden sm:inline">
              ReservaYa Admin
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600"
            >
              <LogOut size={18} className="mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id as AdminTab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  ¡Bienvenido, {user?.name}!
                </h1>
                <p className="text-slate-600">
                  Panel de administración de ReservaYa
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pedidos Hoy */}
                <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        Pedidos Hoy
                      </p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">
                        24
                      </p>
                    </div>
                    <div className="bg-orange-100 rounded-full p-3">
                      <ClipboardList className="text-orange-500" size={22} />
                    </div>
                  </div>
                </div>

                {/* Ingresos Hoy */}
                <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        Ingresos Hoy
                      </p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">
                        $1,240
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <DollarSign className="text-green-500" size={22} />
                    </div>
                  </div>
                </div>

                {/* Mesas Ocupadas */}
                <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        Mesas Ocupadas
                      </p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">
                        8/10
                      </p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <Armchair className="text-blue-500" size={22} />
                    </div>
                  </div>
                </div>

                {/* Tiempo Promedio */}
                <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">
                        Tiempo Promedio
                      </p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">
                        18 min
                      </p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <Clock className="text-purple-500" size={22} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab('menu')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-shadow"
                  >
                    <UtensilsCrossed size={18} className="mr-2" />
                    Gestionar Menú
                  </Button>
                  <Button
                    onClick={() => setActiveTab('pedidos')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow"
                  >
                    <LayoutGrid size={18} className="mr-2" />
                    Ver Pedidos
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
                    <Users size={18} className="mr-2" />
                    Personal
                  </Button>
                  <Button
                    onClick={() => setActiveTab('metricas')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow"
                  >
                    <BarChart3 size={18} className="mr-2" />
                    Reportes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Menu Management */}
          {activeTab === 'menu' && <MenuView />}

          {/* Orders Management */}
          {activeTab === 'pedidos' && <PedidosView />}

          {/* Tables Management */}
          {activeTab === 'mesas' && <MesasView />}

          {/* Staff Management */}
          {activeTab === 'staff' && <StaffView />}

          {/* Metrics */}
          {activeTab === 'metricas' && <MetricasView />}
        </div>
      </main>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificacionesView
          onClose={() => setShowNotifications(false)}
          onClearAll={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
