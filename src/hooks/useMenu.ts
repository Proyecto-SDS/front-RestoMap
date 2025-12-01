'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/apiClient';
import { AdminMenuItem } from '@/types';
import { toast } from 'sonner'; 

export function useMenu() {
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMenuItems();
      setMenuItems(data.datos || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el menú';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (data: {
      nombre: string;
      descripcion: string;
      precio: number;
      categoria: string;
      imagen?: string;
    }) => {
      try {
        await api.createMenuItem(data);
        toast.success('Producto agregado correctamente');
        await fetchMenuItems();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear el producto';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchMenuItems]
  );

  const updateItem = useCallback(
    async (
      id: string,
      data: {
        nombre?: string;
        descripcion?: string;
        precio?: number;
        categoria?: string;
        imagen?: string;
      }
    ) => {
      try {
        await api.updateMenuItem(id, data);
        toast.success('Producto actualizado correctamente');
        await fetchMenuItems();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el producto';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchMenuItems]
  );

  const toggleStock = useCallback(
    async (id: string, enStock: boolean) => {
      try {
        await api.toggleMenuItemStock(id, enStock);
        toast.success(enStock ? 'Producto disponible' : 'Producto sin stock');
        await fetchMenuItems();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el stock';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchMenuItems]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await api.deleteMenuItem(id);
        toast.success('Producto eliminado correctamente');
        await fetchMenuItems();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el producto';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchMenuItems]
  );

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    createItem,
    updateItem,
    toggleStock,
    deleteItem,
    refresh: fetchMenuItems,
  };
}