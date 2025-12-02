import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, X, Loader2 } from 'lucide-react';
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
import { UtensilsCrossed } from 'lucide-react';
import { api } from '@/utils/apiClient';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string; // Corresponde a `categoria_nombre`
  categoryId: number | null; // Corresponde a `id_categoria`
  stock: number; // No viene del backend
  available: boolean; // Corresponde a `estado`
  image?: string; // No viene del backend
}

interface Category {
  id: number;
  nombre: string;
}

export function MenuView() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '', // Se mantiene para el formulario, aunque no venga del backend
    available: true,
    image: '', // Se mantiene para el formulario
  });

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        api.getProductos(),
        api.getCategorias(),
      ]);

      const adaptedProducts = productsData.productos.map((p: any) => ({
        id: p.id,
        name: p.nombre,
        description: p.descripcion,
        price: p.precio,
        category: p.categoria_nombre || 'Sin categoría',
        categoryId: p.id_categoria,
        stock: 50, // Mock, ya que no viene del backend
        available: p.estado === 'disponible',
        image: `https://source.unsplash.com/400x300/?food,${p.nombre.split(' ').join(',')}`, // Imagen mock
      }));

      setMenuItems(adaptedProducts);
      setCategories(categoriesData.categorias);
    } catch (error) {
      toast.error('Error al cargar el menú');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const availableCategories = ['Todo', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        categoryId: item.categoryId?.toString() || '',
        stock: item.stock.toString(),
        available: item.available,
        image: item.image || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        stock: '',
        available: true,
        image: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Por favor completa nombre, precio y categoría.');
      return;
    }

    const payload = {
      nombre: formData.name,
      descripcion: formData.description,
      precio: parseFloat(formData.price),
      id_categoria: parseInt(formData.categoryId),
      estado: formData.available ? 'disponible' : 'agotado',
    };

    try {
      if (editingItem) {
        await api.updateProducto(editingItem.id, payload);
        toast.success('Producto actualizado correctamente');
      } else {
        await api.createProducto(payload);
        toast.success('Producto agregado correctamente');
      }
      fetchMenuData(); // Recargar datos
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(`Error al guardar el producto.`);
      console.error(error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await api.deleteProducto(id);
      toast.success('Producto eliminado correctamente');
      fetchMenuData(); // Recargar datos
    } catch (error) {
      toast.error('Error al eliminar el producto');
      console.error(error);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.available;
    const payload = {
      ...item,
      nombre: item.name,
      precio: item.price,
      id_categoria: item.categoryId,
      estado: newStatus ? 'disponible' : 'agotado',
    };

    try {
      await api.updateProducto(item.id, payload);
      toast.success('Disponibilidad actualizada');
      fetchMenuData();
    } catch (error) {
      toast.error('Error al actualizar la disponibilidad');
    }
  };


  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todo' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">Menú Digital</h1>
              <p className="text-sm text-muted-foreground">Administra productos y stock del menú</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar platillo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 rounded-full border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="group overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border">
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              {item.image ? (
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold px-3 py-1.5 rounded-full shadow-lg text-base transform transition-transform group-hover:scale-105">
                ${new Intl.NumberFormat('es-CL').format(item.price)}
              </div>
              {!item.available && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                  <Badge variant="destructive" className="text-base border-2 border-white/50 py-1 px-4">No Disponible</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4 flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-slate-800 transition-colors group-hover:text-primary pr-2">{item.name}</h3>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 mb-3">{item.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Stock:</span>
                  <span className={`font-bold ${item.stock === 0 ? 'text-destructive' : item.stock < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                    {item.stock}
                  </span>
                </div>
                <Button
                  variant={item.available ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => handleToggleAvailability(item)}
                  className="h-8"
                >
                  {item.available ? 'Desactivar' : 'Activar'}
                </Button>
              </div>

              <div className="flex gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && !loading &&(
        <div className="text-center py-12 bg-white rounded-lg">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al menú'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del producto"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría *</Label>
               <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
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
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
