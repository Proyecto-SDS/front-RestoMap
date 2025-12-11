'use client';

import {
  Edit,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  Wine,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface Categoria {
  id: number;
  nombre: string;
  id_tipo_categoria: number;
  tipo_nombre: string;
  productos_count: number;
}

interface CategoriasManagementProps {
  readOnly?: boolean;
}

const TIPOS_CATEGORIA = [
  { id: 1, nombre: 'Comida', icon: UtensilsCrossed },
  { id: 2, nombre: 'Bebida', icon: Wine },
];

export function CategoriasManagement({
  readOnly = false,
}: CategoriasManagementProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    id_tipo_categoria: '',
  });

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.empresa.getCategorias();
      setCategorias(data || []);
    } catch (error) {
      console.error('Error loading categorias:', error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      id_tipo_categoria: '',
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      id_tipo_categoria: categoria.id_tipo_categoria.toString(),
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.id_tipo_categoria) {
      setError('Complete todos los campos requeridos');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data = {
        nombre: formData.nombre.trim(),
        id_tipo_categoria: parseInt(formData.id_tipo_categoria, 10),
      };

      if (editingCategoria) {
        await api.empresa.updateCategoria(editingCategoria.id, data);
      } else {
        await api.empresa.createCategoria(data);
      }

      await loadCategorias();
      setShowModal(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoria: Categoria) => {
    try {
      setSaving(true);
      setError(null);
      await api.empresa.deleteCategoria(categoria.id);
      await loadCategorias();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filteredCategorias = categorias.filter((c) => {
    const matchesSearch = c.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTipo = !filterTipo || c.id_tipo_categoria === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const countByTipo = (tipoId: number) =>
    categorias.filter((c) => c.id_tipo_categoria === tipoId).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">Total Categorias</p>
          <p className="text-2xl text-[#334155]">{categorias.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed size={14} className="text-[#F97316]" />
            <p className="text-xs text-[#94A3B8]">Comida</p>
          </div>
          <p className="text-2xl text-[#F97316]">{countByTipo(1)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wine size={14} className="text-[#8B5CF6]" />
            <p className="text-xs text-[#94A3B8]">Bebida</p>
          </div>
          <p className="text-2xl text-[#8B5CF6]">{countByTipo(2)}</p>
        </div>
        {!readOnly && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4 flex items-center justify-center">
            <PrimaryButton onClick={handleOpenCreate} className="w-full">
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva</span> Categoria
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTipo(null)}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              filterTipo === null
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            Todos ({categorias.length})
          </button>
          {TIPOS_CATEGORIA.map((tipo) => {
            const Icon = tipo.icon;
            return (
              <button
                key={tipo.id}
                onClick={() => setFilterTipo(tipo.id)}
                className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
                  filterTipo === tipo.id
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                <Icon size={14} />
                {tipo.nombre} ({countByTipo(tipo.id)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
          />
        </div>
      </div>

      {/* Error global */}
      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Categories Table/Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {filteredCategorias.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen size={48} className="text-[#94A3B8] mx-auto mb-4" />
            <h3 className="text-[#334155] mb-2">No hay categorias</h3>
            <p className="text-sm text-[#64748B]">
              {searchTerm
                ? 'No se encontraron categorias con ese nombre'
                : 'Agrega tu primera categoria'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs text-[#64748B] font-medium">
                      Nombre
                    </th>
                    <th className="text-left px-6 py-3 text-xs text-[#64748B] font-medium">
                      Tipo
                    </th>
                    <th className="text-center px-6 py-3 text-xs text-[#64748B] font-medium">
                      Productos
                    </th>
                    {!readOnly && (
                      <th className="text-center px-6 py-3 text-xs text-[#64748B] font-medium w-32">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredCategorias.map((categoria) => {
                    const TipoIcon =
                      TIPOS_CATEGORIA.find(
                        (t) => t.id === categoria.id_tipo_categoria
                      )?.icon || FolderOpen;
                    return (
                      <tr
                        key={categoria.id}
                        className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#334155] font-medium">
                            {categoria.nombre}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              categoria.id_tipo_categoria === 1
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            <TipoIcon size={12} />
                            {categoria.tipo_nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-[#64748B]">
                            {categoria.productos_count}
                          </span>
                        </td>
                        {!readOnly && (
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(categoria)}
                                className="p-1.5 text-[#64748B] hover:bg-[#F1F5F9] rounded transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(categoria)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                                disabled={saving}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {filteredCategorias.map((categoria) => {
                const TipoIcon =
                  TIPOS_CATEGORIA.find(
                    (t) => t.id === categoria.id_tipo_categoria
                  )?.icon || FolderOpen;
                return (
                  <div
                    key={categoria.id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#334155] font-medium truncate">
                        {categoria.nombre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                            categoria.id_tipo_categoria === 1
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          <TipoIcon size={10} />
                          {categoria.tipo_nombre}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {categoria.productos_count} productos
                        </span>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEdit(categoria)}
                          className="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(categoria)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          disabled={saving}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-[#334155]">
                {editingCategoria ? 'Editar Categoria' : 'Nueva Categoria'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#F1F5F9] rounded transition-colors"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                  placeholder="Ej: Hamburguesas, Cervezas..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-2">
                  Tipo *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS_CATEGORIA.map((tipo) => {
                    const Icon = tipo.icon;
                    const isSelected =
                      formData.id_tipo_categoria === tipo.id.toString();
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            id_tipo_categoria: tipo.id.toString(),
                          })
                        }
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? tipo.id === 1
                              ? 'border-[#F97316] bg-orange-50 text-[#F97316]'
                              : 'border-[#8B5CF6] bg-purple-50 text-[#8B5CF6]'
                            : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">
                          {tipo.nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <SecondaryButton
                onClick={() => setShowModal(false)}
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                onClick={handleSave}
                className="flex-1"
                disabled={
                  saving ||
                  !formData.nombre.trim() ||
                  !formData.id_tipo_categoria
                }
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
