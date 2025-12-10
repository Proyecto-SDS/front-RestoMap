'use client';

import {
  Check,
  Clock,
  Edit2,
  Globe,
  Image as ImageIcon,
  Link,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Store,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface LocalInfo {
  id: number;
  nombre: string;
  telefono: number;
  correo: string;
  descripcion?: string;
  tipo_local?: string;
  rut_empresa?: string;
  direccion?: {
    calle: string;
    numero: number;
    comuna?: string;
  };
  horarios?: Horario[];
  redes?: Red[];
}

interface Horario {
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  abierto: boolean;
}

interface Red {
  id_tipo_red: number;
  tipo_nombre?: string;
  nombre_usuario: string;
}

interface Foto {
  id: number;
  ruta: string;
  tipo: string;
}

interface FotosData {
  banner: Foto | null;
  capturas: Foto[];
}

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

// Opciones de hora de 00:00 a 23:30 en intervalos de 30 minutos
const HORAS_OPCIONES = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  const value = `${hours.toString().padStart(2, '0')}:${minutes}`;
  return { value, label: value };
});

export function LocalConfigManager() {
  const [localInfo, setLocalInfo] = useState<LocalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de edición por sección
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingHorarios, setEditingHorarios] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    descripcion: '',
  });

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [fotos, setFotos] = useState<FotosData>({
    banner: null,
    capturas: [],
  });

  const [redes, setRedes] = useState<Red[]>([]);
  const [tiposRed, setTiposRed] = useState<{ id: number; nombre: string }[]>(
    []
  );
  const [editingRedes, setEditingRedes] = useState(false);

  useEffect(() => {
    loadLocalInfo();
    loadFotos();
    loadTiposRed();
  }, []);

  const loadTiposRed = async () => {
    try {
      const data = await api.empresa.getTiposRed();
      setTiposRed(data);
    } catch (err) {
      console.error('Error loading social types:', err);
    }
  };

  const loadLocalInfo = async () => {
    try {
      setLoading(true);
      const data = await api.empresa.getLocalInfo();
      setLocalInfo(data);
      setFormData({
        nombre: data.nombre || '',
        telefono: String(data.telefono || ''),
        correo: data.correo || '',
        descripcion: data.descripcion || '',
      });
      setHorarios(data.horarios || []);

      // Mapear redes existentes a tipos
      // Si el local tiene redes, las usamos
      if (data.redes) {
        setRedes(data.redes);
      }
    } catch (err) {
      console.error('Error loading local info:', err);
      setError('No se pudo cargar la información del local');
    } finally {
      setLoading(false);
    }
  };

  const loadFotos = async () => {
    try {
      const data = await api.empresa.getFotos();
      setFotos(data);
    } catch (err) {
      console.error('Error loading fotos:', err);
    }
  };

  const handleCancelInfo = () => {
    if (localInfo) {
      setFormData({
        nombre: localInfo.nombre || '',
        telefono: String(localInfo.telefono || ''),
        correo: localInfo.correo || '',
        descripcion: localInfo.descripcion || '',
      });
    }
    setEditingInfo(false);
  };

  const handleCancelHorarios = () => {
    if (localInfo) {
      setHorarios(localInfo.horarios || []);
    }
    setEditingHorarios(false);
  };

  const handleSaveInfo = async () => {
    if (!localInfo) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.empresa.updateLocalInfo(localInfo.id, {
        nombre: formData.nombre,
        telefono: parseInt(formData.telefono) || 0,
        correo: formData.correo,
        descripcion: formData.descripcion,
      });

      setSuccess('Información actualizada correctamente');
      setEditingInfo(false);
      await loadLocalInfo();
    } catch (err) {
      console.error('Error saving local info:', err);
      setError('Error al guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHorarios = async () => {
    if (!localInfo) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.empresa.updateLocalHorarios(localInfo.id, horarios);

      setSuccess('Horarios actualizados correctamente');
      setEditingHorarios(false);
      await loadLocalInfo();
    } catch (err) {
      console.error('Error saving horarios:', err);
      setError('Error al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  const handleHorarioChange = (
    dia: number,
    field: keyof Horario,
    value: string | boolean
  ) => {
    setHorarios((prev) => {
      const existing = prev.find((h) => h.dia_semana === dia);
      if (existing) {
        return prev.map((h) =>
          h.dia_semana === dia ? { ...h, [field]: value } : h
        );
      } else {
        return [
          ...prev,
          {
            dia_semana: dia,
            hora_apertura: '09:00',
            hora_cierre: '22:00',
            abierto: true,
            [field]: value,
          },
        ];
      }
    });
  };

  const handleCancelRedes = () => {
    if (localInfo && localInfo.redes) {
      setRedes(localInfo.redes);
    } else {
      setRedes([]);
    }
    setEditingRedes(false);
  };

  const handleSaveRedes = async () => {
    if (!localInfo) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Enviar solo las redes con nombre de usuario válido
      const redesToSend = redes.filter(
        (r) => r.nombre_usuario && r.nombre_usuario.trim() !== ''
      );

      // Mapear para enviar nombre_usuario al backend
      const payload = redesToSend.map((r) => ({
        id_tipo_red: r.id_tipo_red,
        nombre_usuario: r.nombre_usuario,
      }));

      await api.empresa.updateLocalRedes(localInfo.id, payload);

      setSuccess('Redes sociales actualizadas correctamente');
      setEditingRedes(false);
      await loadLocalInfo();
    } catch (err) {
      console.error('Error saving redes:', err);
      setError('Error al guardar las redes sociales');
    } finally {
      setSaving(false);
    }
  };

  const handleRedChange = (idTipo: number, nombreUsuario: string) => {
    setRedes((prev) => {
      const existingIndex = prev.findIndex((r) => r.id_tipo_red === idTipo);

      if (existingIndex >= 0) {
        const newRedes = [...prev];
        newRedes[existingIndex] = {
          ...newRedes[existingIndex],
          nombre_usuario: nombreUsuario,
        };
        return newRedes;
      } else {
        return [
          ...prev,
          { id_tipo_red: idTipo, nombre_usuario: nombreUsuario },
        ];
      }
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const base64 = await convertFileToBase64(file);
      await api.empresa.updateBanner(base64, file.name);

      setSuccess('Banner actualizado correctamente');
      await loadFotos();
    } catch (err) {
      console.error('Error uploading banner:', err);
      setError('Error al actualizar el banner');
    } finally {
      setSaving(false);
    }
  };

  const handleCapturaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    // Validar cantidad máxima
    if (fotos.capturas.length >= 15) {
      setError('Máximo 15 fotos permitidas');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const base64 = await convertFileToBase64(file);
      await api.empresa.agregarCaptura(base64, file.name);

      setSuccess('Foto agregada correctamente');
      await loadFotos();
    } catch (err) {
      console.error('Error uploading captura:', err);
      setError('Error al agregar la foto');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarCaptura = async (fotoId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.empresa.eliminarCaptura(fotoId);

      setSuccess('Foto eliminada correctamente');
      await loadFotos();
    } catch (err) {
      console.error('Error deleting captura:', err);
      setError('Error al eliminar la foto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Información Básica */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-[#334155] flex items-center gap-2">
            <Store size={20} className="text-[#F97316]" />
            Información del Local
          </h2>
          {!editingInfo && (
            <SecondaryButton onClick={() => setEditingInfo(true)}>
              <Edit2 size={16} />
              Editar
            </SecondaryButton>
          )}
        </div>

        {editingInfo ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Nombre del Local *{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.nombre.length}/50)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: e.target.value.slice(0, 50),
                    })
                  }
                  maxLength={50}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1 flex items-center gap-1">
                  <Phone size={14} />
                  Teléfono *{' '}
                  <span className="text-xs text-[#94A3B8]">(9 dígitos)</span>
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setFormData({ ...formData, telefono: value });
                  }}
                  maxLength={9}
                  placeholder="912345678"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1 flex items-center gap-1">
                  <Mail size={14} />
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) =>
                    setFormData({ ...formData, correo: e.target.value })
                  }
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-[#64748B] mb-1">
                  Descripción{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.descripcion.length}/250)
                  </span>
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descripcion: e.target.value.slice(0, 250),
                    })
                  }
                  maxLength={250}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 resize-none"
                  placeholder="Describe tu local..."
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <SecondaryButton onClick={handleCancelInfo} disabled={saving}>
                <X size={16} />
                Cancelar
              </SecondaryButton>
              <PrimaryButton onClick={handleSaveInfo} disabled={saving}>
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </PrimaryButton>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Nombre del Local</p>
                <p className="text-sm text-[#334155] font-medium">
                  {localInfo?.nombre || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
                  <Phone size={12} />
                  Teléfono
                </p>
                <p className="text-sm text-[#334155] font-medium">
                  {localInfo?.telefono || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
                  <Mail size={12} />
                  Correo
                </p>
                <p className="text-sm text-[#334155] font-medium">
                  {localInfo?.correo || '-'}
                </p>
              </div>
            </div>
            {localInfo?.descripcion && (
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Descripción</p>
                <p className="text-sm text-[#334155]">
                  {localInfo.descripcion}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Campos solo lectura siempre visibles */}
        <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
          <p className="text-xs text-[#94A3B8] mb-3">
            Información no editable (contacta a soporte para modificar)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">RUT Empresa</p>
              <p className="text-sm text-[#64748B]">
                {localInfo?.rut_empresa || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">Tipo de Local</p>
              <p className="text-sm text-[#64748B]">
                {localInfo?.tipo_local || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
                <MapPin size={12} />
                Dirección
              </p>
              <p className="text-sm text-[#64748B]">
                {localInfo?.direccion
                  ? `${localInfo.direccion.calle} ${
                      localInfo.direccion.numero
                    }, ${localInfo.direccion.comuna || ''}`
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-[#334155] flex items-center gap-2">
            <Clock size={20} className="text-[#F97316]" />
            Horarios de Atención
          </h2>
          {!editingHorarios && (
            <SecondaryButton onClick={() => setEditingHorarios(true)}>
              <Edit2 size={16} />
              Editar
            </SecondaryButton>
          )}
        </div>

        {editingHorarios ? (
          <>
            <div className="space-y-3">
              {DIAS_SEMANA.map((dia) => {
                const horario = horarios.find(
                  (h) => h.dia_semana === dia.value
                );
                const abierto = horario?.abierto ?? true;

                return (
                  <div
                    key={dia.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-[#F8FAFC] rounded-lg"
                  >
                    <div className="w-28 font-medium text-[#334155]">
                      {dia.label}
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={abierto}
                        onChange={(e) =>
                          handleHorarioChange(
                            dia.value,
                            'abierto',
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded text-[#F97316]"
                      />
                      <span className="text-sm text-[#64748B]">Abierto</span>
                    </label>
                    {abierto && (
                      <div className="flex items-center gap-2">
                        <select
                          value={horario?.hora_apertura || '09:00'}
                          onChange={(e) =>
                            handleHorarioChange(
                              dia.value,
                              'hora_apertura',
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        >
                          {HORAS_OPCIONES.map((hora) => (
                            <option key={hora.value} value={hora.value}>
                              {hora.label}
                            </option>
                          ))}
                        </select>
                        <span className="text-[#94A3B8] font-medium">a</span>
                        <select
                          value={horario?.hora_cierre || '22:00'}
                          onChange={(e) =>
                            handleHorarioChange(
                              dia.value,
                              'hora_cierre',
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        >
                          {HORAS_OPCIONES.map((hora) => (
                            <option key={hora.value} value={hora.value}>
                              {hora.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <SecondaryButton onClick={handleCancelHorarios} disabled={saving}>
                <X size={16} />
                Cancelar
              </SecondaryButton>
              <PrimaryButton onClick={handleSaveHorarios} disabled={saving}>
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </PrimaryButton>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DIAS_SEMANA.map((dia) => {
              const horario = horarios.find((h) => h.dia_semana === dia.value);
              const abierto = horario?.abierto ?? false;

              return (
                <div
                  key={dia.value}
                  className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg"
                >
                  <span className="font-medium text-[#334155] text-sm">
                    {dia.label}
                  </span>
                  {abierto ? (
                    <span className="text-sm text-[#22C55E] flex items-center gap-1">
                      <Check size={14} />
                      {horario?.hora_apertura || '09:00'} -{' '}
                      {horario?.hora_cierre || '22:00'}
                    </span>
                  ) : (
                    <span className="text-sm text-[#94A3B8]">Cerrado</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redes Sociales */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-[#334155] flex items-center gap-2">
            <Globe size={20} className="text-[#F97316]" />
            Redes Sociales
          </h2>
          {!editingRedes && (
            <SecondaryButton onClick={() => setEditingRedes(true)}>
              <Edit2 size={16} />
              Editar
            </SecondaryButton>
          )}
        </div>

        {editingRedes ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiposRed.map((tipo) => {
                const currentRed = redes.find((r) => r.id_tipo_red === tipo.id);

                // Determinar placeholder e icono según el tipo de red
                const getPlaceholder = () => {
                  const nombre = tipo.nombre.toLowerCase();
                  if (nombre.includes('whatsapp')) return '56912345678';
                  if (nombre.includes('sitio') || nombre.includes('web'))
                    return 'https://tusitio.com';
                  if (
                    nombre.includes('instagram') ||
                    nombre.includes('tiktok') ||
                    nombre.includes('twitter') ||
                    nombre.includes('youtube')
                  )
                    return '@tu_cuenta';
                  return 'tu_perfil';
                };

                const isWebOrWhatsApp =
                  tipo.nombre.toLowerCase().includes('sitio') ||
                  tipo.nombre.toLowerCase().includes('web') ||
                  tipo.nombre.toLowerCase().includes('whatsapp');

                return (
                  <div key={tipo.id}>
                    <label className="block text-sm text-[#64748B] mb-1">
                      {tipo.nombre}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isWebOrWhatsApp ? (
                          <Link size={14} className="text-[#94A3B8]" />
                        ) : (
                          <span className="text-[#94A3B8] text-sm">@</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentRed?.nombre_usuario || ''}
                        onChange={(e) =>
                          handleRedChange(tipo.id, e.target.value)
                        }
                        placeholder={getPlaceholder()}
                        className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <SecondaryButton onClick={handleCancelRedes} disabled={saving}>
                <X size={16} />
                Cancelar
              </SecondaryButton>
              <PrimaryButton onClick={handleSaveRedes} disabled={saving}>
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </PrimaryButton>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {redes.length === 0 ? (
              <p className="text-sm text-[#94A3B8] col-span-full py-2">
                No hay redes sociales configuradas
              </p>
            ) : (
              redes.map((red) => {
                const tipo = tiposRed.find((t) => t.id === red.id_tipo_red);
                return (
                  <div
                    key={red.id_tipo_red}
                    className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg overflow-hidden"
                  >
                    <div className="p-2 bg-white rounded-full text-[#F97316] shrink-0">
                      <Globe size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#94A3B8] mb-0.5">
                        {tipo?.nombre || 'Red Social'}
                      </p>
                      <p className="text-sm text-[#334155] font-medium truncate">
                        @{red.nombre_usuario}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Imágenes del Local */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-[#334155] flex items-center gap-2">
            <ImageIcon size={20} className="text-[#F97316]" />
            Imágenes del Local
          </h2>
        </div>

        {/* Banner */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#334155]">
              Imagen Banner{' '}
              <span className="text-xs text-[#94A3B8]">(Solo 1 permitida)</span>
            </h3>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                disabled={saving}
              />
              <div className="px-3 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm flex items-center gap-2">
                <Upload size={16} />
                {fotos.banner ? 'Cambiar' : 'Subir'} Banner
              </div>
            </label>
          </div>
          {fotos.banner ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotos.banner.ruta}
                alt="Banner"
                className="w-full h-48 object-cover rounded-lg border border-[#E2E8F0]"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={saving}
                  />
                  <div className="px-4 py-2 bg-white text-[#334155] rounded-lg hover:bg-[#F8FAFC] transition-colors text-sm flex items-center gap-2">
                    <Edit2 size={16} />
                    Cambiar Imagen
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 border-2 border-dashed border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center text-[#94A3B8]">
              <ImageIcon size={48} className="mb-2" />
              <p className="text-sm">No hay banner configurado</p>
            </div>
          )}
        </div>

        {/* Capturas/Galería */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#334155]">
              Galería de Fotos{' '}
              <span className="text-xs text-[#94A3B8]">
                ({fotos.capturas.length}/15)
              </span>
            </h3>
            {fotos.capturas.length < 15 && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCapturaUpload}
                  className="hidden"
                  disabled={saving}
                />
                <div className="px-3 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm flex items-center gap-2">
                  <Plus size={16} />
                  Agregar Foto
                </div>
              </label>
            )}
          </div>
          {fotos.capturas.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fotos.capturas.map((foto) => (
                <div key={foto.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto.ruta}
                    alt={`Captura ${foto.id}`}
                    className="w-full h-32 object-cover rounded-lg border border-[#E2E8F0]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleEliminarCaptura(foto.id)}
                      disabled={saving}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-32 border-2 border-dashed border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center text-[#94A3B8]">
              <ImageIcon size={32} className="mb-2" />
              <p className="text-sm">No hay fotos en la galería</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
