import React from 'react';
import { TrendingUp, ShoppingCart, Users, UserPlus } from 'lucide-react';

interface Stats {
  ventasHoy: number;
  trendVentas: number;
  ordenesHoy: number;
  ordenesEnProceso: number;
  empleadosTotal: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  clientesHoy: number;
  clientesNuevos: number;
}

interface StatsOverviewProps {
  stats: Stats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const cards = [
    {
      id: 'ventas',
      title: 'Vendidos Hoy',
      value: formatCurrency(stats.ventasHoy || 0),
      trend: stats.trendVentas > 0 ? `+${stats.trendVentas}% vs ayer` : `${stats.trendVentas}% vs ayer`,
      trendPositive: stats.trendVentas >= 0,
      icon: TrendingUp,
      iconBg: 'bg-orange-100',
      iconColor: 'text-[#F97316]',
    },
    {
      id: 'ordenes',
      title: 'Órdenes Hoy',
      value: stats.ordenesHoy || 0,
      trend: `${stats.ordenesEnProceso || 0} en proceso`,
      trendPositive: true,
      icon: ShoppingCart,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'empleados',
      title: 'Empleados',
      value: stats.empleadosTotal || 0,
      trend: `${stats.empleadosActivos || 0} activos, ${stats.empleadosInactivos || 0} inactivos`,
      trendPositive: true,
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-[#22C55E]',
    },
    {
      id: 'clientes',
      title: 'Clientes Hoy',
      value: stats.clientesHoy || 0,
      trend: `${stats.clientesNuevos || 0} nuevos`,
      trendPositive: true,
      icon: UserPlus,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon size={24} className={card.iconColor} />
              </div>
            </div>
            
            <h3 className="text-sm text-[#94A3B8] mb-2">{card.title}</h3>
            <p className={`text-3xl ${card.id === 'ventas' ? 'text-[#F97316]' : 'text-[#334155]'} mb-2`}>
              {card.value}
            </p>
            <p className={`text-xs ${card.trendPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {card.trend}
            </p>
          </div>
        );
      })}
    </div>
  );
}
