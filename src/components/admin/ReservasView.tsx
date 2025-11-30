'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Check,
  X,
  MoreHorizontal,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
// Importamos tu cliente API real
import { api } from '@/utils/apiClient';

// Tipos
type ReservationStatus =
  | 'pendiente'
  | 'confirmada'
  | 'cancelada'
  | 'completada';

interface Reservation {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  pax: number;
  table?: string;
  status: ReservationStatus;
  requestDate: string;
}

export function ReservasView() {
  // Iniciamos vacío porque cargaremos del backend
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // --- CONEXIÓN CON BACKEND ---
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Llamada real a tu API
        const data = await api.getAdminReservations();
        setReservations(data);
      } catch (error) {
        console.error(error);
        toast.error('Error cargando reservas');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cambiar estado (Visualmente por ahora, idealmente conectaría con API de update)
  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );

    if (newStatus === 'confirmada') toast.success(`Reserva confirmada`);
    if (newStatus === 'cancelada') toast.info(`Reserva rechazada`);
  };

  // Filtrado local
  const filteredReservations = reservations.filter(
    (res) =>
      res.clientName.toLowerCase().includes(filter.toLowerCase()) ||
      res.status.includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Solicitudes de Reserva
          </h2>
          <p className="text-sm text-slate-500">
            Gestiona las reservas entrantes
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar cliente o estado..."
              className="pl-9 bg-slate-50 border-slate-200 focus:ring-orange-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" className="text-slate-600 border-slate-200">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </div>
      </div>

      {/* Tabla de Reservas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
            <p>Cargando reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <p>No se encontraron reservas.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((res) => (
                <TableRow key={res.id} className="hover:bg-slate-50/50">
                  {/* Cliente */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {res.clientName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {res.clientEmail}
                      </p>
                    </div>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-sm text-slate-700">
                        <Calendar className="mr-2 h-3.5 w-3.5 text-orange-500" />
                        {res.date}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="mr-2 h-3.5 w-3.5 text-blue-500" />
                        {res.time}
                      </div>
                    </div>
                  </TableCell>

                  {/* Personas */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{res.pax}</span>
                    </div>
                  </TableCell>

                  {/* Estado (Badge) */}
                  <TableCell>
                    <Badge
                      className={`
                      ${
                        res.status === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                          : ''
                      }
                      ${
                        res.status === 'confirmada'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                          : ''
                      }
                      ${
                        res.status === 'cancelada'
                          ? 'bg-red-50 text-red-700 hover:bg-red-50 border-red-100'
                          : ''
                      }
                    `}
                      variant="outline"
                    >
                      {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    {res.status === 'pendiente' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                          onClick={() =>
                            handleStatusChange(res.id, 'confirmada')
                          }
                        >
                          <Check className="h-4 w-4 mr-1" /> Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                          onClick={() =>
                            handleStatusChange(res.id, 'cancelada')
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(res.id, 'pendiente')
                            }
                          >
                            Marcar como Pendiente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleStatusChange(res.id, 'cancelada')
                            }
                          >
                            Cancelar Reserva
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
