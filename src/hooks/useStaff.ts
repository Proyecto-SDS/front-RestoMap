'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/apiClient';
import { Staff } from '@/types';
import { toast } from 'sonner';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  // Cargar personal
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStaff();
      setStaff(data.datos || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el personal';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generar invitación para nuevo empleado
  const createInvitation = useCallback(
    async (data: { email: string; rol: string }) => {
      try {
        const response = await api.createStaffInvitation(data);
        
        // Generar link de invitación (simulado)
        const baseUrl = window.location.origin;
        const token = response.datos?.token || 'temp-token';
        const link = `${baseUrl}/register/staff?token=${token}&email=${encodeURIComponent(data.email)}`;
        
        setInvitationLink(link);
        
        toast.success('Invitación generada correctamente');
        
        // Copiar al portapapeles
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(link);
          toast.success('Link copiado al portapapeles');
        }
        
        await fetchStaff();
        return { success: true, link };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al generar invitación';
        toast.error(errorMessage);
        return { success: false, link: null };
      }
    },
    [fetchStaff]
  );

  // Actualizar datos de empleado
  const updateStaff = useCallback(
    async (
      id: string,
      data: {
        nombre?: string;
        email?: string;
        telefono?: string;
        rol?: string;
      }
    ) => {
      try {
        await api.updateStaff(id, data);
        toast.success('Empleado actualizado correctamente');
        await fetchStaff();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar empleado';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchStaff]
  );

  // Desvincular empleado (acción crítica)
  const removeStaff = useCallback(
    async (id: string) => {
      try {
        await api.removeStaff(id);
        toast.success('Empleado desvinculado correctamente');
        await fetchStaff();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al desvincular empleado';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchStaff]
  );

  // Actualizar estado del empleado
  const updateStaffStatus = useCallback(
    async (id: string, estado: string) => {
      try {
        await api.updateStaffStatus(id, estado);
        toast.success('Estado actualizado correctamente');
        await fetchStaff();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchStaff]
  );

  // Limpiar link de invitación
  const clearInvitationLink = useCallback(() => {
    setInvitationLink(null);
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    loading,
    error,
    invitationLink,
    createInvitation,
    updateStaff,
    removeStaff,
    updateStaffStatus,
    clearInvitationLink,
    refresh: fetchStaff,
  };
}