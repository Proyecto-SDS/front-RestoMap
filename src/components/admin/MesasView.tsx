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

type TableStatus = 'disponible' | 'ocupada' | 'reservada' | 'fuera_de_servicio';

interface Table {
  id: number;
  numero: number; // Changed from 'nombre' to 'numero' to align with backend and useTables
  capacidad: number;
  estado: TableStatus;
}

export function MesasView() {
  const { tables: backendTables, loading, createTable, updateTable, toggleBlock, deleteTable, isTableNumberUnique } = useTables();
  const [tables, setTables] = useState<Table[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    numero: '', // Changed from 'nombre'
    capacidad: '',
    estado: 'disponible' as TableStatus,
  });

  useEffect(() => {
    // Keep local 'tables' state in sync with 'backendTables' from the hook
    if (backendTables) {
      const adaptedTables = backendTables.map(t => ({
        id: parseInt(t.id),
        numero: t.numero,
        capacidad: t.capacidad,
        estado: (t.estaBloqueada ? 'ocupada' : 'disponible') as TableStatus, // Assuming block status maps to ocupada
      }));
      setTables(adaptedTables);
    }
  }, [backendTables]);

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
      border: 'border-pink-400', // This seems inconsistent, should it be amber?
      dot: 'bg-pink-500', // This seems inconsistent, should it be amber?
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
        numero: table.numero.toString(),
        capacidad: table.capacidad.toString(),
        estado: table.estado,
      });
    } else {
      setEditingTable(null);
      setFormData({
        numero: '',
        capacidad: '',
        estado: 'disponible',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveTable = async () => {
    if (!formData.numero || !formData.capacidad) {
      toast.error('Número de mesa y capacidad son requeridos');
      return;
    }

    const tableNumero = parseInt(formData.numero, 10);
    const tableCapacidad = parseInt(formData.capacidad, 10);

    if (isNaN(tableNumero) || isNaN(tableCapacidad)) {
      toast.error('Número de mesa y capacidad deben ser números válidos');
      return;
    }

    // Validación de número único
    if (!editingTable && !isTableNumberUnique(tableNumero)) {
      toast.error('Ya existe una mesa con ese número');
      return;
    }
    if (editingTable && !isTableNumberUnique(tableNumero, editingTable.id.toString())) {
      toast.error('Ya existe una mesa con ese número');
      return;
    }

    const backendData = {
      nombre: `Mesa ${formData.numero}`, // Backend expects 'nombre'
      numero: tableNumero,
      capacidad: tableCapacidad,
    };

    if (editingTable) {
      const success = await updateTable(editingTable.id.toString(), backendData);
      if (success) {
        toast.success('Mesa actualizada correctamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar la mesa');
      }
    } else {
      const success = await createTable(backendData);
      if (success) {
        toast.success('Mesa creada correctamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al crear la mesa');
      }
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) {
      return;
    }
    const success = await deleteTable(id.toString());
    if (success) {
      toast.success('Mesa eliminada correctamente');
    } else {
      toast.error('Error al eliminar la mesa');
    }
  };

  const handleToggleBlock = async (id: number) => {
    const table = tables.find(t => t.id === id);
    if (table) {
      const shouldBlock = table.estado === 'disponible'; // If it's available, block it (make it 'ocupada')
      const newStatus: TableStatus = shouldBlock ? 'ocupada' : 'disponible';
      
      const success = await toggleBlock(id.toString(), shouldBlock);
      
      if (success) {
        toast.success(shouldBlock ? 'Mesa bloqueada' : 'Mesa desbloqueada');
      } else {
        toast.error('Error al cambiar el estado de la mesa');
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
}
