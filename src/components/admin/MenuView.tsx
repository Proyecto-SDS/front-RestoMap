'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  X,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { api } from '@/utils/apiClient'; // Still needed for categories for now
import { useMenu } from '@/hooks/useMenu';
import { AdminMenuItem } from '@/types'; // Import the type from types.ts if it's the source of truth

interface Category {
  id: number;
  nombre: string;
}

export function MenuView() {
  const {
    menuItems: hookMenuItems,
    loading: hookLoading,
    createItem,
    updateItem,
    toggleStock,
    deleteItem,
  } = useMenu();

  // Local state derived from hook data
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true); // Control local loading while categories fetch
  
  const [categories, setCategories] = useState<Category[]>([]);

  // UI States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '', // No longer directly used for backend, but useful for display/UI
    available: true,
    image: '',
  });

  // Fetch categories separately for now
  const fetchCategories = async () => {
    try {
      const categoriesResponse = await api.getCategorias();
      const rawCategories = categoriesResponse.categorias || categoriesResponse;
      setCategories(rawCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    }
  };

  useEffect(() => {
    setLoading(hookLoading); // Sync loading state from hook
    setMenuItems(hookMenuItems); // Sync menu items from hook
  }, [hookMenuItems, hookLoading]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories for display
  const filterCategories = ['Todo', ...categories.map((c) => c.nombre)];

  // Handle Dialog (Modal)
  const handleOpenDialog = (item?: AdminMenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.nombre,
        description: item.descripcion,
        price: item.precio.toString(),
        categoryId: item.id_categoria?.toString() || '',
        stock: '0', // Stock is not part of AdminMenuItem or update payload in useMenu
        available: item.enStock,
        image: item.imagen || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        stock: '0',
        available: true,
        image: '',
      });
    }
    setIsDialogOpen(true);
  };

  // Save (Create or Edit)
  const handleSaveItem = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Por favor completa nombre, precio y categoría.');
      return false; // Return false to indicate failure
    }

    const categoryName = categories.find(cat => cat.id.toString() === formData.categoryId)?.nombre;
    if (!categoryName) {
      toast.error('Categoría seleccionada no válida.');
      return false;
    }

    const itemData = {
      nombre: formData.name,
      descripcion: formData.description,
      precio: parseFloat(formData.price),
      categoria: categoryName, // Use category name as expected by useMenu hook
      imagen: formData.image,
    };

    let success = false;
    if (editingItem) {
      success = await updateItem(editingItem.id.toString(), itemData);
    } else {
      success = await createItem(itemData);
    }

    if (success) {
      setIsDialogOpen(false);
      // useMenu hook will automatically refresh menuItems
    }
    return success;
  };

  // Delete
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    await deleteItem(id);
  };

  // Toggle availability
  const handleToggleAvailability = async (item: AdminMenuItem) => {
    await toggleStock(item.id.toString(), !item.enStock);
  };

  // Client-side filtering
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryName = categories.find(cat => cat.id === item.id_categoria)?.nombre || 'Sin categoría';

    const matchesCategory =
      selectedCategory === 'Todo' || categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="mt-4 text-slate-500">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* --- HEADER DE SECCIÓN --- */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Menú Digital
              </h1>
              <p className="text-sm text-slate-500">
                Gestiona tus productos y precios
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-lg border-slate-200 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- GRID DE PRODUCTOS --- */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">
            No se encontraron productos
          </h3>
          <p className="text-slate-400">
            Intenta con otra búsqueda o categoría
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-orange-200"
            >
              {/* Imagen */}
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {item.imagen ? (
                  <ImageWithFallback
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UtensilsCrossed className="h-12 w-12" />
                  </div>
                )}

                {/* Badge de Precio */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 font-bold px-3 py-1 rounded-full shadow-sm text-sm border border-slate-100">
                  ${item.precio.toLocaleString('es-CL')}
                </div>

                {/* Overlay No Disponible */}
                {!item.enStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                    <Badge
                      variant="destructive"
                      className="text-sm px-3 py-1 border-2 border-white"
                    >
                      Agotado
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {item.nombre}
                  </h3>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                  {item.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                      onClick={() => handleOpenDialog(item)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 ${
                        item.enStock
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-slate-400'
                      }`}
                      onClick={() => handleToggleAvailability(item)}
                      title={
                        item.enStock
                          ? 'Marcar como Agotado'
                          : 'Marcar como Disponible'
                      }
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteItem(item.id.toString())} // Ensure ID is string
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- MODAL DE EDICIÓN / CREACIÓN --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Modifica los detalles del platillo.'
                : 'Agrega un nuevo platillo al menú.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="focus:ring-orange-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="h-20 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="focus:ring-orange-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock (Ref)</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger className="focus:ring-orange-500">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveItem}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {editingItem ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
