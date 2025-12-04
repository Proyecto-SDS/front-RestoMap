
import { Edit, Search } from 'lucide-react';
import { useState } from 'react';
import { Producto } from '../../screens/cocinero/DashboardCocineroScreen';
import { Toast, useToast } from '../notifications/Toast';
import { EditProductModal } from './EditProductModal';

interface InventarioCocineroProps {
  productos: Producto[];
  onProductoUpdate: (producto: Producto) => void;
  onRefresh?: () => void | Promise<void>;
}

export function InventarioCocinero({ productos, onProductoUpdate }: InventarioCocineroProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [sortBy, setSortBy] = useState<'nombre' | 'categoria'>('nombre');
  const { toast, showToast, hideToast } = useToast();

  // Get unique categories (excluding alcohol)
  const categories = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria_nombre)))];

  // Filter and sort products
  const filteredProductos = productos
    .filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.categoria_nombre === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'nombre') {
        return a.nombre.localeCompare(b.nombre);
      } else {
        return a.categoria_nombre.localeCompare(b.categoria_nombre);
      }
    });

  // Get category color
  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Comidas': '#3B82F6',
      'Acompañamientos': '#F97316',
      'Postres': '#EC4899',
      'Bebidas Sin Alcohol': '#22C55E',
    };
    return colors[categoria] || '#94A3B8';
  };

  // Toggle availability
  const handleToggleAvailability = async (producto: Producto) => {
    try {
      // Mock API call - PATCH /api/empresa/productos/{id}
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedProducto = {
        ...producto,
        disponible: !producto.disponible,
      };

      onProductoUpdate(updatedProducto);
      showToast(
        'success',
        `${producto.nombre} marcado como ${!producto.disponible ? 'disponible' : 'no disponible'}`
      );
    } catch {
      alert('Error al actualizar el stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#334155] mb-2">Inventario de Cocina</h1>
        <p className="text-[#64748B]">
          Gestiona la disponibilidad de productos. Los productos NO disponibles no aparecerán en el menú del cliente.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'nombre' | 'categoria')}
            className="px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="categoria">Ordenar por categoría</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {filteredProductos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#94A3B8]">
              {searchTerm
                ? 'No se encontraron productos'
                : 'No hay productos en esta categoría'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">Producto</th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">Categoría</th>
                  <th className="text-left px-6 py-3 text-xs text-[#64748B]">Precio</th>
                  <th className="text-center px-6 py-3 text-xs text-[#64748B]">Estado</th>
                  <th className="text-center px-6 py-3 text-xs text-[#64748B]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((producto) => (
                  <tr
                    key={producto.id}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    {/* Producto */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#334155]">{producto.nombre}</p>
                    </td>

                    {/* Categoría */}
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: getCategoryColor(producto.categoria_nombre) }}
                      >
                        {producto.categoria_nombre}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#64748B]">
                        ${producto.precio.toLocaleString('es-CL')}
                      </p>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleToggleAvailability(producto)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            producto.disponible ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              producto.disponible ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs ${
                            producto.disponible ? 'text-[#22C55E]' : 'text-[#94A3B8]'
                          }`}
                        >
                          {producto.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedProducto(producto)}
                          className="p-2 text-[#64748B] hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">Total Productos</p>
          <p className="text-2xl text-[#334155]">{productos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">Disponibles</p>
          <p className="text-2xl text-[#22C55E]">
            {productos.filter(p => p.disponible).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#94A3B8] mb-1">No Disponibles</p>
          <p className="text-2xl text-[#EF4444]">
            {productos.filter(p => !p.disponible).length}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedProducto && (
        <EditProductModal
          producto={selectedProducto}
          onClose={() => setSelectedProducto(null)}
          onUpdate={onProductoUpdate}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
