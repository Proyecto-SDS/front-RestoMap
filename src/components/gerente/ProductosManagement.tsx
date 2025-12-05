'use client';

import { Edit, Package, Plus, Search, Trash2, X } from 'lucide-react';
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
}

interface ProductosManagementProps {
  readOnly?: boolean;
}

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

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
  });

  const loadProductos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.empresa.getProductos(filterCategoria || undefined);
      setProductos(data || []);
    } catch (error) {
      console.error('Error loading productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategoria]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setFormData({ nombre: '', descripcion: '', precio: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.precio) return;

    try {
      setSaving(true);
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        precio: parseInt(formData.precio, 10),
      };

      if (editingProducto) {
        await api.empresa.updateProducto(editingProducto.id, data);
      } else {
        await api.empresa.createProducto(data);
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

  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorias = [
    ...new Set(productos.map((p) => p.categoria_nombre).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl text-[#334155] mb-1">Inventario</h2>
            <p className="text-sm text-[#94A3B8]">
              {productos.length} productos registrados
            </p>
          </div>
          {!readOnly && (
            <PrimaryButton onClick={handleOpenCreate}>
              <Plus size={16} />
              Nuevo Producto
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
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
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155]"
          >
            <option value="">Todas las categorias</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProductos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <Package size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="text-[#334155] mb-2">No hay productos</h3>
          <p className="text-sm text-[#64748B]">
            {searchTerm
              ? 'No se encontraron productos con ese nombre'
              : 'Agrega tu primer producto'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProductos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-[#334155] font-medium">
                    {producto.nombre}
                  </h3>
                  {producto.categoria_nombre && (
                    <span className="text-xs text-[#94A3B8]">
                      {producto.categoria_nombre}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    producto.estado === 'disponible'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {producto.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              {producto.descripcion && (
                <p className="text-sm text-[#64748B] mb-3 line-clamp-2">
                  {producto.descripcion}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#F97316]">
                  {formatCurrency(producto.precio)}
                </span>

                {!readOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleEstado(producto)}
                      className={`px-2 py-1 rounded text-xs ${
                        producto.estado === 'disponible'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {producto.estado === 'disponible'
                        ? 'No Disponible'
                        : 'Activar'}
                    </button>
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                  Descripcion
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, precio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                  placeholder="0"
                />
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
