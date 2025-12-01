'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LayoutDashboard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useTables } from '@/hooks/useTables';

type TableStatus = 'disponible' | 'ocupada' | 'reservada';

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: TableStatus;
}

const initialTables: Table[] = [
  { id: 1, number: '1', capacity: 2, status: 'disponible' },
  { id: 2, number: '2', capacity: 4, status: 'ocupada' },
  { id: 3, number: '3', capacity: 4, status: 'disponible' },
  { id: 4, number: '4', capacity: 6, status: 'reservada' },
  { id: 5, number: '5', capacity: 2, status: 'disponible' },
];

export function MesasView() {
  const { tables: backendTables, loading, createTable, updateTable, toggleBlock, deleteTable, isTableNumberUnique } = useTables();
  const [tables, setTables] = useState<Table[]>(initialTables);
  useEffect(() => {
    if (backendTables && backendTables.length > 0) {
      const adaptedTables = backendTables.map(t => ({
        id: parseInt(t.id),
        number: t.numero.toString(),
        capacity: t.capacidad,
        status: (t.estaBloqueada ? 'ocupada' : 'disponible') as TableStatus,
      }));
      setTables(adaptedTables);
    }
  }, [backendTables]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    status: 'disponible' as TableStatus,
  });

  const statusColors = {
    disponible: 'bg-green-500',
    ocupada: 'bg-red-500',
    reservada: 'bg-yellow-500',
  };

  const statusLabels = {
    disponible: 'Disponible',
    ocupada: 'Ocupada',
    reservada: 'Reservada',
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number,
        capacity: table.capacity.toString(),
        status: table.status,
      });
    } else {
      setEditingTable(null);
      setFormData({
        number: '',
        capacity: '',
        status: 'disponible',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveTable = async() => {
    if (!formData.number || !formData.capacity) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    // Validación de número único
    const tableNumber = parseInt(formData.number);
    if (!editingTable && !isTableNumberUnique(tableNumber)) {
      toast.error('Ya existe una mesa con ese número');
      return;
    }
    if (editingTable && !isTableNumberUnique(tableNumber, editingTable.id.toString())) {
      toast.error('Ya existe una mesa con ese número');
      return;
    }
    const backendData = {
      nombre: `Mesa ${formData.number}`,
      numero: tableNumber,
      capacidad: parseInt(formData.capacity),
    };
    if (editingTable) {
      const success = await updateTable(editingTable.id.toString(), backendData);
      if (!success){
      setTables(
        tables.map((t) =>
          t.id === editingTable.id
            ? { ...t, ...formData, capacity: parseInt(formData.capacity) }
            : t
        )
      );
    }
  } else {
      const success = await createTable(backendData);
      if (!success) {
        const newTable: Table = {
          id: Math.max(...tables.map((t) => t.id), 0) + 1,
          number: formData.number,
          capacity: parseInt(formData.capacity),
          status: formData.status,
        };
        setTables([...tables, newTable]);
        toast.success('Mesa creada correctamente');
      }
    }
    setIsDialogOpen(false);
  };

  const handleDeleteTable = async(id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) {
      return;
    }
    const success = await deleteTable(id.toString());
    if (!success) {
      setTables(tables.filter((t) => t.id !== id));
      toast.success('Mesa eliminada correctamente');
    }
  };
  const handleToggleBlock = async (id: number) => {
    const table = tables.find(t => t.id === id);
    if (table) {
      // Si está ocupada, la bloqueamos; si no, la desbloqueamos
      const shouldBlock = table.status !== 'ocupada';
      const newStatus: TableStatus = shouldBlock ? 'ocupada' : 'disponible';
      
      const success = await toggleBlock(id.toString(), shouldBlock);
      
      if (!success) {
        // Fallback local
        setTables(tables.map((t) =>
          t.id === id ? { ...t, status: newStatus } : t
        ));
        toast.success(shouldBlock ? 'Mesa bloqueada' : 'Mesa desbloqueada');
      }
    }
  };
  if (loading && tables.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Cargando mesas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
              <p className="text-sm text-muted-foreground">
                Administra las mesas y su disponibilidad
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Mesa
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="number">Número de Mesa</Label>
              <Input
                id="number"
                placeholder="Ej: 1, 2, 3"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Número de personas"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TableStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="ocupada">Ocupada</SelectItem>
                  <SelectItem value="reservada">Reservada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTable}>
              {editingTable ? 'Guardar Cambios' : 'Agregar Mesa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const styles = {
            disponible: {
              bg: 'bg-green-50',
              border: 'border-green-400',
              dot: 'bg-green-500',
              text: 'text-green-700',
            },
            ocupada: {
              bg: 'bg-orange-50',
              border: 'border-orange-400',
              dot: 'bg-orange-500',
              text: 'text-orange-700',
            },
            reservada: {
              bg: 'bg-amber-50',
              border: 'border-pink-400',
              dot: 'bg-pink-500',
              text: 'text-amber-800',
            },
          };

          const style = styles[table.status];
          return (
            <Card
              key={table.id}
              className={`relative border-4 ${style.border} ${style.bg}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Mesa {table.number}</CardTitle>
                    <CardDescription className={style.text}>
                      {table.capacity} personas
                    </CardDescription>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${style.dot}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={style.text}>{statusLabels[table.status]}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(table)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={table.status === 'ocupada' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleBlock(table.id)}
                    title={table.status === 'ocupada' ? 'Desbloquear mesa' : 'Bloquear mesa'}
                  >
                    {table.status === 'ocupada' ? '🔓' : '🔒'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTable(table.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
