'use client';

import {
  Edit,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../utils/apiClient';
import { DangerButton } from '../buttons/DangerButton';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  estado: 'disponible' | 'agotado';
  categoria_id?: number;
  categoria_nombre?: string;
  tipo_categoria_id?: number;
  imagen?: string;
}

interface CategoriaApi {
  id: number;
  nombre: string;
  id_tipo_categoria: number;
  tipo_nombre: string;
  productos_count: number;
}

interface ProductosManagementProps {
  readOnly?: boolean;
}

const TIPOS_CATEGORIA = [
  { id: 1, nombre: 'Comida' },
  { id: 2, nombre: 'Bebida' },
];

export function ProductosManagement({
  readOnly = false,
}: ProductosManagementProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Producto | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [categoriasFromApi, setCategoriasFromApi] = useState<CategoriaApi[]>(
    []
  );

  // Estado para imagen
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    tipo_categoria_id: '',
    categoria_id: '',
  });

  const loadProductos = useCallback(async () => {
    try {
      setLoading(true);
      const [productosData, categoriasData] = await Promise.all([
        api.empresa.getProductos(),
        api.empresa.getCategorias(),
      ]);
      setProductos(productosData || []);
      setCategoriasFromApi(categoriasData || []);
    } catch (error) {
      console.error('Error loading productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      tipo_categoria_id: '',
      categoria_id: '',
    });
    setImagenPreview(null);
    setImagenFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = async (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      tipo_categoria_id: producto.tipo_categoria_id?.toString() || '',
      categoria_id: producto.categoria_id?.toString() || '',
    });
    setImagenPreview(null);
    setImagenFile(null);

    // Cargar imagen existente
    try {
      const response = await api.empresa.getFotoProducto(producto.id);
      if (response?.foto?.ruta) {
        setImagenPreview(response.foto.ruta);
      }
    } catch {
      // No hay imagen o error
    }

    setShowModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validar tamano (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagenPreview(base64);
      setImagenFile(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (
      !formData.nombre ||
      !formData.precio ||
      !formData.tipo_categoria_id ||
      !formData.categoria_id
    )
      return;

    try {
      setSaving(true);
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        precio: parseInt(formData.precio, 10),
        categoria_id: formData.categoria_id
          ? parseInt(formData.categoria_id, 10)
          : undefined,
      };

      let productoId = editingProducto?.id;

      if (editingProducto) {
        await api.empresa.updateProducto(editingProducto.id, data);
      } else {
        const response = await api.empresa.createProducto(data);
        productoId = response.producto?.id;
      }

      // Subir imagen si hay una nueva
      if (imagenFile && productoId) {
        try {
          await api.empresa.updateFotoProducto(productoId, imagenFile);
        } catch {
          console.error('Error subiendo imagen');
        }
      }

      await loadProductos();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving producto:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      setSaving(true);
      await api.empresa.deleteProducto(showDeleteConfirm.id);
      await loadProductos();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting producto:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (producto: Producto) => {
    try {
      const nuevoEstado =
        producto.estado === 'disponible' ? 'agotado' : 'disponible';
      await api.empresa.updateProductoEstado(producto.id, nuevoEstado);
      await loadProductos();
    } catch (error) {
      console.error('Error updating estado:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  const filteredProductos = productos.filter((p) => {
    const matchesSearch = p.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !filterCategoria || p.categoria_nombre === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Extraer categorias unicas con ID, nombre y TIPO desde la API
  const categoriasConId = categoriasFromApi.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    tipo_id: c.id_tipo_categoria,
  }));

  const categorias = categoriasFromApi.map((c) => c.nombre);

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">Total Productos</p>
          <p className="text-2xl text-[#334155]">{productos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">Disponibles</p>
          <p className="text-2xl text-[#22C55E]">
            {productos.filter((p) => p.estado === 'disponible').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">Agotados</p>
          <p className="text-2xl text-[#EF4444]">
            {productos.filter((p) => p.estado !== 'disponible').length}
          </p>
        </div>
        {!readOnly && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4 flex items-center justify-center">
            <PrimaryButton onClick={handleOpenCreate} className="w-full">
              <Plus size={16} />
              Nuevo Producto
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategoria('')}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              filterCategoria === ''
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategoria(cat || '')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filterCategoria === cat
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
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
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {filteredProductos.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="text-[#94A3B8] mx-auto mb-4" />
            <h3 className="text-[#334155] mb-2">No hay productos</h3>
            <p className="text-sm text-[#64748B]">
              {searchTerm
                ? 'No se encontraron productos con ese nombre'
                : 'Agrega tu primer producto'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">
                    Producto
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">
                    Tipo
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">
                    Categoria
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">
                    Precio
                  </th>
                  <th className="text-center px-6 py-3 text-xs text-[#64748B] w-40">
                    Estado
                  </th>
                  {!readOnly && (
                    <th className="text-center px-6 py-3 text-xs text-[#64748B] w-32">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((producto) => (
                  <tr
                    key={producto.id}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {producto.imagen ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-12 h-12 object-cover rounded-lg border border-[#E2E8F0] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={20} className="text-[#94A3B8]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-[#334155] font-medium">
                            {producto.nombre}
                          </p>
                          {producto.descripcion && (
                            <p className="text-xs text-[#94A3B8] line-clamp-1">
                              {producto.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#64748B]">
                        {TIPOS_CATEGORIA.find(
                          (t) => t.id === producto.tipo_categoria_id
                        )?.nombre || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#64748B]">
                        {producto.categoria_nombre || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#F97316]">
                        {formatCurrency(producto.precio)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        {!readOnly ? (
                          <button
                            onClick={() => handleToggleEstado(producto)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              producto.estado === 'disponible'
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                producto.estado === 'disponible'
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              producto.estado === 'disponible'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {producto.estado === 'disponible'
                              ? 'Disponible'
                              : 'Agotado'}
                          </span>
                        )}
                      </div>
                    </td>
                    {!readOnly && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(producto)}
                            className="p-1.5 text-[#64748B] hover:bg-[#F1F5F9] rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(producto)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-[#334155]">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#F1F5F9] rounded"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

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
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Tipo Categoría *
                </label>
                <select
                  value={formData.tipo_categoria_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_categoria_id: e.target.value,
                      categoria_id: '',
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                >
                  <option value="">Seleccionar tipo</option>
                  {TIPOS_CATEGORIA.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria_id: e.target.value })
                  }
                  disabled={!formData.tipo_categoria_id}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 ${
                    !formData.tipo_categoria_id
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                      : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categoriasConId
                    .filter(
                      (cat) =>
                        !formData.tipo_categoria_id ||
                        cat.tipo_id === parseInt(formData.tipo_categoria_id)
                    )
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Descripcion{' '}
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
                  placeholder="Descripcion del producto"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseInt(val) >= 0) {
                      setFormData({ ...formData, precio: val });
                    }
                  }}
                  min="0"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748B] mb-1">
                  Imagen del producto
                </label>
                <div className="flex items-start gap-4">
                  {imagenPreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-[#E2E8F0]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagenPreview(null);
                          setImagenFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center bg-[#F8FAFC]">
                      <ImageIcon size={24} className="text-[#94A3B8]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="producto-imagen-input"
                    />
                    <label
                      htmlFor="producto-imagen-input"
                      className="inline-flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] bg-white hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    >
                      <ImageIcon size={16} />
                      Seleccionar imagen
                    </label>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      PNG, JPG o WEBP. Max 2MB
                    </p>
                  </div>
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
                disabled={saving || !formData.nombre || !formData.precio}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#334155]">Eliminar Producto</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="p-1 hover:bg-[#F1F5F9] rounded"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                Esta a punto de eliminar el producto{' '}
                <strong>{showDeleteConfirm.nombre}</strong>.
              </p>
              <p className="text-xs text-red-600 mt-2">
                Esta accion no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <SecondaryButton
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </SecondaryButton>
              <DangerButton
                onClick={handleDelete}
                className="flex-1"
                disabled={saving}
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </DangerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
