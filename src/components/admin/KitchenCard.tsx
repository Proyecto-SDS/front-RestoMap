import { Clock, CheckCircle2, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KitchenCardProps {
  id: number;
  table: string;
  waiter: string;
  time: string;
  total: number;
  items: OrderItem[];
  status: 'pendiente' | 'en_preparacion' | 'listo'; // Estos deben coincidir con los estados de tu PedidosView
  onAction: () => void;
}

export function KitchenCard({
  table,
  waiter,
  time,
  total,
  items,
  status,
  onAction,
}: KitchenCardProps) {
  // Configuración de estilos según el estado
  const styles = {
    pendiente: {
      border: 'border-red-300',
      bg: 'bg-white',
      headerBg: 'bg-red-50',
      btnClass: 'bg-orange-500 hover:bg-orange-600 text-white',
      btnText: 'Empezar a Preparar',
      BtnIcon: Play,
    },
    en_preparacion: {
      border: 'border-orange-300',
      bg: 'bg-white',
      headerBg: 'bg-orange-50',
      btnClass: 'bg-green-500 hover:bg-green-600 text-white',
      btnText: 'Marcar como Listo',
      BtnIcon: Check,
    },
    listo: {
      border: 'border-green-400',
      bg: 'bg-green-50',
      headerBg: 'bg-green-100',
      btnClass: 'bg-slate-700 hover:bg-slate-800 text-white',
      btnText: 'Entregado',
      BtnIcon: CheckCircle2,
    },
  };

  const current = styles[status];
  const Icon = current.BtnIcon;

  return (
    <Card
      className={`overflow-hidden border-2 ${current.border} shadow-sm transition-all hover:shadow-md h-full flex flex-col`}
    >
      {/* Encabezado de la Tarjeta */}
      <div
        className={`px-4 py-3 ${current.headerBg} flex justify-between items-center border-b ${current.border}`}
      >
        <div>
          <h3 className="text-lg font-bold text-slate-800">Mesa {table}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
            <span className="mx-1">•</span>
            <span>{waiter}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-base font-bold text-slate-700">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Lista de Platos */}
      <div className={`p-4 flex-1 ${current.bg}`}>
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                {item.quantity}x
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-800">{item.name}</span>
                {item.notes && (
                  <p className="text-xs text-red-500 italic mt-0.5">
                    Nota: {item.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón de Acción (Footer) */}
      <div className={`p-3 ${current.bg} border-t ${current.border}`}>
        <Button
          className={`w-full font-semibold shadow-none ${current.btnClass}`}
          onClick={onAction}
        >
          <Icon className="mr-2 h-4 w-4" />
          {current.btnText}
        </Button>
      </div>
    </Card>
  );
}
