import { Calendar } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MetricsDashboardProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

export function MetricsDashboard({
  dateRange,
  onDateRangeChange,
}: MetricsDashboardProps) {
  // Mock data - replace with real data from API
  const dailySalesData = [
    { day: '1', ventas: 45000 },
    { day: '5', ventas: 52000 },
    { day: '10', ventas: 48000 },
    { day: '15', ventas: 61000 },
    { day: '20', ventas: 55000 },
    { day: '25', ventas: 67000 },
    { day: '30', ventas: 59000 },
  ];

  const topProductsData = [
    { nombre: 'Lomo Saltado', cantidad: 145, ingresos: 2175000 },
    { nombre: 'Ceviche', cantidad: 132, ingresos: 1848000 },
    { nombre: 'Pizza Margherita', cantidad: 128, ingresos: 1536000 },
    { nombre: 'Hamburguesa Premium', cantidad: 98, ingresos: 1470000 },
    { nombre: 'Sushi Roll', cantidad: 87, ingresos: 1305000 },
  ];

  const lowProductsData = [
    { nombre: 'Ensalada César', cantidad: 12 },
    { nombre: 'Sopa del día', cantidad: 15 },
    { nombre: 'Tarta de manzana', cantidad: 18 },
    { nombre: 'Pasta Carbonara', cantidad: 21 },
    { nombre: 'Tacos al pastor', cantidad: 24 },
  ];

  const categoriesData = [
    { name: 'Platos principales', value: 45, color: '#F97316' },
    { name: 'Bebidas', value: 25, color: '#3B82F6' },
    { name: 'Postres', value: 15, color: '#22C55E' },
    { name: 'Entradas', value: 10, color: '#8B5CF6' },
    { name: 'Otros', value: 5, color: '#94A3B8' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl text-[#334155] mb-1">Métricas y Reportes</h2>
            <p className="text-sm text-[#94A3B8]">
              Análisis de ventas y productos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date range selector */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value)}
                className="appearance-none pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mes</option>
                <option value="personalizado">Personalizado</option>
              </select>
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
          <h3 className="text-[#334155] mb-2">Ingresos Totales</h3>
          <p className="text-3xl text-[#F97316] mb-1">
            {formatCurrency(3450000)}
          </p>
          <p className="text-sm text-[#64748B] mb-4">
            Promedio por orden: {formatCurrency(45000)}
          </p>

          {/* Mini sparkline */}
          <div style={{ width: '100%', height: '64px', minHeight: '64px' }}>
            <ResponsiveContainer width="100%" height={64}>
              <LineChart data={dailySalesData}>
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
          <h3 className="text-[#334155] mb-2">Órdenes Completadas</h3>
          <p className="text-3xl text-blue-600 mb-1">287</p>
          <p className="text-sm text-[#64748B] mb-4">
            Promedio mesas por orden: 2.3
          </p>

          {/* Mini pie chart */}
          <div className="h-16 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#22C55E] rounded-full"></div>
              <span className="text-xs text-[#64748B]">Completadas: 287</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#F97316] rounded-full"></div>
              <span className="text-xs text-[#64748B]">En proceso: 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top & Low Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top 5 productos mas vendidos */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
          <h3 className="text-[#334155] mb-6">Top 5 Más Vendidos</h3>
          <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="nombre"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'ingresos') return formatCurrency(value);
                    return value;
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="cantidad" fill="#F97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 productos menos vendidos */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
          <h3 className="text-[#334155] mb-6">Top 5 Menos Vendidos</h3>
          <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={lowProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="nombre"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="cantidad" fill="#94A3B8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
        <h3 className="text-[#334155] mb-6">Ventas Diarias (Este Mes)</h3>
        <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                label={{ value: 'Día', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) =>
                  `$${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ fill: '#F97316', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
        <h3 className="text-[#334155] mb-6">Distribución por Categorías</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '320px',
              minHeight: '320px',
            }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string;
                    percent?: number;
                  }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-3">
            {categoriesData.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="text-sm text-[#334155]">{cat.name}</span>
                </div>
                <span className="text-sm text-[#64748B]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
