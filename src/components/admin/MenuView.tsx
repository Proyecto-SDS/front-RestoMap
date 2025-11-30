import { useState } from 'react';
import { Plus, Edit, Trash2, Package, Search, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { UtensilsCrossed } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  available: boolean;
  image?: string;
}

const initialMenuItems: MenuItem[] = [
  { 
    id: 1, 
    name: 'Empanadas de Pino', 
    description: 'Tradicionales empanadas chilenas rellenas de carne, cebolla, huevo y aceitunas', 
    price: 2.50, 
    category: 'Entradas', 
    stock: 25, 
    available: true,
    image: 'https://images.unsplash.com/photo-1646314230198-e27c375e1a2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXBhbmFkYXMlMjBmb29kfGVufDF8fHx8MTc2MjIyMzk2MXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 2, 
    name: 'Ensalada César', 
    description: 'Lechuga fresca, crutones, queso parmesano y aderezo césar casero', 
    price: 3.20, 
    category: 'Entradas', 
    stock: 15, 
    available: true,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZHxlbnwxfHx8fDE3NjIyMjA0ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 3, 
    name: 'Completo Italiano', 
    description: 'Hot dog con tomate, palta y mayonesa al estilo chileno', 
    price: 2.80, 
    category: 'Platos Principales', 
    stock: 20, 
    available: true,
    image: 'https://images.unsplash.com/photo-1613482084286-41f25b486fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2d8ZW58MXx8fHwxNzYyMjA2NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 4, 
    name: 'Hamburguesa Campus', 
    description: 'Hamburguesa de carne con queso cheddar, lechuga, tomate y papas fritas', 
    price: 4.50, 
    category: 'Platos Principales', 
    stock: 18, 
    available: true,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmcmllc3xlbnwxfHx8fDE3NjIyMDI2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 5, 
    name: 'Sándwich de Pollo', 
    description: 'Pechuga de pollo a la plancha con palta, tomate y mayonesa', 
    price: 3.80, 
    category: 'Platos Principales', 
    stock: 12, 
    available: true,
    image: 'https://images.unsplash.com/photo-1703219342329-fce8488cf443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2FuZHdpY2h8ZW58MXx8fHwxNzYyMTc0OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 6, 
    name: 'Pasta Carbonara', 
    description: 'Pasta fresca con salsa carbonara, tocino y queso parmesano', 
    price: 4.20, 
    category: 'Platos Principales', 
    stock: 10, 
    available: true,
    image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGNhcmJvbmFyYXxlbnwxfHx8fDE3NjIyMjgwMzB8MA&ixlibrb-4.1.0&q=80&w=1080'
  },
  { 
    id: 7, 
    name: 'Brownie con Helado', 
    description: 'Brownie de chocolate casero servido con helado de vainilla', 
    price: 2.50, 
    category: 'Postres', 
    stock: 8, 
    available: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBicm93bmllfGVufDF8fHx8MTc2MjIxNTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 8, 
    name: 'Cerveza Artesanal', 
    description: 'IPA local 500ml', 
    price: 3.00, 
    category: 'Bebidas', 
    stock: 48, 
    available: true,
    image: 'https://images.unsplash.com/photo-1615332579037-3c44b3660b53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdCUyMGJlZXJ8ZW58MXx8fHwxNzYyMTk5NDE4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

export function MenuView() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    available: true,
    image: '',
  });

  const categories = ['Todo', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
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
        category: '',
        stock: '',
        available: true,
        image: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              name: formData.name,
              description: formData.description,
              price: parseFloat(formData.price),
              category: formData.category,
              stock: parseInt(formData.stock) || 0,
              available: formData.available,
              image: formData.image,
            }
          : item
      ));
      toast.success('Producto actualizado correctamente');
    } else {
      const newItem: MenuItem = {
        id: Math.max(...menuItems.map(item => item.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        available: formData.available,
        image: formData.image,
      };
      setMenuItems([...menuItems, newItem]);
      toast.success('Producto agregado correctamente');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast.success('Producto eliminado correctamente');
  };

  const handleToggleAvailability = (id: number) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
    toast.success('Disponibilidad actualizada');
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todo' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          {categories.map(category => (
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
                ${new Intl.NumberFormat('es-CL').format(item.price * 1000)}
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
                  onClick={() => handleToggleAvailability(item.id)}
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

      {filteredItems.length === 0 && (
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
              <Input
                id="category"
                placeholder="Ej: Entradas, Platos Principales, Postres"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
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
