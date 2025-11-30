import { BarChart3, DollarSign, ShoppingBag, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from './StatCard';
import { ProductosView } from './ProductosView';
import { HorariosPicoView } from './HorariosPicoView';

const salesData = [
  { day: 'Lun', ventas: 420, pedidos: 32 },
  { day: 'Mar', ventas: 380, pedidos: 28 },
  { day: 'Mié', ventas: 520, pedidos: 41 },
  { day: 'Jue', ventas: 490, pedidos: 38 },
  { day: 'Vie', ventas: 680, pedidos: 52 },
  { day: 'Sáb', ventas: 820, pedidos: 64 },
  { day: 'Dom', ventas: 750, pedidos: 58 },
];

export function MetricasView() {
  const [activeTab, setActiveTab] = useState('ventas');
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      {/* Header Estilo Figma */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Métricas y Análisis
            </h1>
            <p className="text-sm text-slate-500">
              Visualiza el rendimiento de tu negocio
            </p>
          </div>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales (Semana)"
          value="$ 4060.00"
          trend="+12.5%"
          trendUp={true}
          subtext="vs semana anterior"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Total Pedidos"
          value="313"
          trend="+8.3%"
          trendUp={true}
          subtext="vs semana anterior"
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Ticket Promedio"
          value="$ 12.97"
          subtext="Por pedido"
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Tiempo Preparación"
          value="18 min"
          subtext="Promedio"
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Botones tipo Chips */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === 'ventas'
              ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              : 'bg-transparent text-slate-500 hover:bg-white/50'
          }`}
        >
          Ventas
        </button>
        <button
          onClick={() => setActiveTab('productos')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === 'productos'
              ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              : 'bg-transparent text-slate-500 hover:bg-white/50'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('horarios')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === 'horarios'
              ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              : 'bg-transparent text-slate-500 hover:bg-white/50'
          }`}
        >
          Horarios Pico
        </button>
      </div>

      {/* Gráficos */}
      <div>
        {activeTab === 'ventas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle>Ventas por Día</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar
                      dataKey="ventas"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle>Pedidos por Día</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pedidos"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'productos' && <ProductosView />}
        {activeTab === 'horarios' && <HorariosPicoView />}
      </div>
    </div>
  );
}
