'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/apiClient';
import { AdminTable } from '@/types';
import { toast } from 'sonner';

export function useTables() {
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mesas
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTables();
      setTables(data.datos || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las mesas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar número único
  const isTableNumberUnique = useCallback(
    (numero: number, excludeId?: string) => {
      return !tables.some((table) => table.numero === numero && table.id !== excludeId);
    },
    [tables]
  );

  // Crear nueva mesa
  const createTable = useCallback(
    async (data: { nombre: string; numero: number; capacidad: number }) => {
      try {
        // Validar número único antes de enviar
        if (!isTableNumberUnique(data.numero)) {
          toast.error('Ya existe una mesa con ese número');
          return false;
        }

        await api.createTable(data);
        toast.success('Mesa creada correctamente');
        await fetchTables();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear la mesa';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchTables, isTableNumberUnique]
  );

  // Actualizar mesa existente
  const updateTable = useCallback(
    async (
      id: string,
      data: {
        nombre?: string;
        numero?: number;
        capacidad?: number;
      }
    ) => {
      try {
        // Validar número único si se está cambiando
        if (data.numero && !isTableNumberUnique(data.numero, id)) {
          toast.error('Ya existe una mesa con ese número');
          return false;
        }

        await api.updateTable(id, data);
        toast.success('Mesa actualizada correctamente');
        await fetchTables();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la mesa';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchTables, isTableNumberUnique]
  );

  // Toggle bloqueo de mesa
  const toggleBlock = useCallback(
    async (id: string, estaBloqueada: boolean) => {
      try {
        await api.toggleTableBlock(id, estaBloqueada);
        toast.success(
          estaBloqueada 
            ? 'Mesa bloqueada correctamente' 
            : 'Mesa desbloqueada correctamente'
        );
        await fetchTables();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el estado';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchTables]
  );

  // Eliminar mesa
  const deleteTable = useCallback(
    async (id: string) => {
      try {
        await api.deleteTable(id);
        toast.success('Mesa eliminada correctamente');
        await fetchTables();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la mesa';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchTables]
  );

  // Cargar datos al montar
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    toggleBlock,
    deleteTable,
    isTableNumberUnique,
    refresh: fetchTables,
  };
}