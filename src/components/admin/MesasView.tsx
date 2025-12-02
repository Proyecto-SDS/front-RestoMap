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
import {
  Dialog,
  DialogContent,
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
import { toast } from 'sonner';
import { api } from '@/utils/apiClient';

type TableStatus = 'disponible' | 'ocupada' | 'reservada' | 'fuera_de_servicio';

interface Table {
  id: number;
  nombre: string;
  capacidad: number;
  estado: TableStatus;
}

export function MesasView() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    estado: 'disponible' as TableStatus,
  });

  const fetchTables = async () => {
    try {
      const data = await api.getMesas();
      setTables(data.mesas);
    } catch (error) {
      toast.error('Error al cargar las mesas');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const statusLabels: { [key in TableStatus]: string } = {
    disponible: 'Disponible',
    ocupada: 'Ocupada',
    reservada: 'Reservada',
    fuera_de_servicio: 'Fuera de Servicio',
  };

  const statusStyles: { [key in TableStatus]: { bg: string, border: string, dot: string, text: string } } = {
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
    fuera_de_servicio: {
      bg: 'bg-slate-50',
      border: 'border-slate-400',
      dot: 'bg-slate-500',
      text: 'text-slate-700',
    },
  };


  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        nombre: table.nombre,
        capacidad: table.capacidad.toString(),
        estado: table.estado,
      });
    } else {
      setEditingTable(null);
      setFormData({
        nombre: '',
        capacidad: '',
        estado: 'disponible',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveTable = async () => {
    if (!formData.nombre || !formData.capacidad) {
      toast.error('Nombre y capacidad son requeridos');
      return;
    }

    const tableData = {
      ...formData,
      capacidad: parseInt(formData.capacidad, 10),
    };

    try {
      if (editingTable) {
        await api.updateMesa(editingTable.id, tableData);
        toast.success('Mesa actualizada correctamente');
      } else {
        await api.createMesa(tableData);
        toast.success('Mesa creada correctamente');
      }
      fetchTables();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar la mesa');
      console.error(error);
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await api.deleteMesa(id);
      toast.success('Mesa eliminada correctamente');
      fetchTables();
    } catch (error) {
      toast.error('Error al eliminar la mesa');
      console.error(error);
    }
  };

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
              <Label htmlFor="nombre">Nombre de Mesa</Label>
              <Input
                id="nombre"
                placeholder="Ej: Mesa 1, Terraza 2"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacidad">Capacidad</Label>
              <Input
                id="capacidad"
                type="number"
                placeholder="Número de personas"
                value={formData.capacidad}
                onChange={(e) =>
                  setFormData({ ...formData, capacidad: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: TableStatus) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="ocupada">Ocupada</SelectItem>
                  <SelectItem value="fuera_de_servicio">Fuera de Servicio</SelectItem>
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
          const style = statusStyles[table.estado];
          return (
            <Card
              key={table.id}
              className={`relative border-4 ${style.border} ${style.bg}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{table.nombre}</CardTitle>
                    <CardDescription className={style.text}>
                      {table.capacidad} personas
                    </CardDescription>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${style.dot}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={style.text}>{statusLabels[table.estado]}</div>
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
                    variant="destructive"
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
