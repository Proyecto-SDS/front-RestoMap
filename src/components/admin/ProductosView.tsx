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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const topProductsData = [
  { name: 'Pizza', vendidos: 120 },
  { name: 'Hamburguesa', vendidos: 98 },
  { name: 'Sushi', vendidos: 75 },
  { name: 'Pasta', vendidos: 60 },
  { name: 'Tacos', vendidos: 45 },
];

const revenueByProductData = [
  { name: 'Pizza', ingresos: 1800 },
  { name: 'Hamburguesa', ingresos: 1176 },
  { name: 'Sushi', ingresos: 1500 },
  { name: 'Pasta', ingresos: 720 },
  { name: 'Tacos', ingresos: 405 },
];

export function ProductosView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>Últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="vendidos" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle>Ingresos por Producto</CardTitle>
          <CardDescription>Últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByProductData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}