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

const peakHoursData = [
  { hour: '11:00', pedidos: 15 },
  { hour: '12:00', pedidos: 28 },
  { hour: '13:00', pedidos: 45 },
  { hour: '14:00', pedidos: 32 },
  { hour: '18:00', pedidos: 22 },
  { hour: '19:00', pedidos: 38 },
  { hour: '20:00', pedidos: 61 },
  { hour: '21:00', pedidos: 55 },
];

export function HorariosPicoView() {
  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle>Horarios con Mayor Afluencia</CardTitle>
        <CardDescription>Últimos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={peakHoursData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="pedidos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
