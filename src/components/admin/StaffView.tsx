import { useState } from 'react';
import { Plus, Edit, Trash2, UserCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

type StaffRole = 'mesero' | 'cocinero' | 'bartender';
type StaffStatus = 'activo' | 'descanso' | 'ausente';

interface StaffMember {
  id: number;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  status: StaffStatus;
  shift: string;
}

const initialStaff: StaffMember[] = [
  {
    id: 1,
    name: 'Carlos Mendez',
    role: 'mesero',
    email: 'carlos.mendez@email.com',
    phone: '+34 612 345 678',
    status: 'activo',
    shift: 'Mañana',
  },
  {
    id: 2,
    name: 'Ana López',
    role: 'mesero',
    email: 'ana.lopez@email.com',
    phone: '+34 623 456 789',
    status: 'activo',
    shift: 'Tarde',
  },
  {
    id: 3,
    name: 'Miguel Torres',
    role: 'cocinero',
    email: 'miguel.torres@email.com',
    phone: '+34 634 567 890',
    status: 'activo',
    shift: 'Mañana',
  },
  {
    id: 4,
    name: 'Laura García',
    role: 'cocinero',
    email: 'laura.garcia@email.com',
    phone: '+34 645 678 901',
    status: 'descanso',
    shift: 'Tarde',
  },
  {
    id: 5,
    name: 'Roberto Sánchez',
    role: 'bartender',
    email: 'roberto.sanchez@email.com',
    phone: '+34 656 789 012',
    status: 'activo',
    shift: 'Noche',
  },
];

export function StaffView() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    role: 'mesero' as StaffRole,
    email: '',
    phone: '',
    status: 'activo' as StaffStatus,
    shift: '',
  });

  const roleLabels = {
    mesero: 'Mesero',
    cocinero: 'Cocinero',
    bartender: 'Bartender',
  };

  const statusLabels = {
    activo: 'Activo',
    descanso: 'En Descanso',
    ausente: 'Ausente',
  };

  const statusColors = {
    activo: 'default' as const,
    descanso: 'secondary' as const,
    ausente: 'destructive' as const,
  };

  const handleOpenDialog = (member?: StaffMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone,
        status: member.status,
        shift: member.shift,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: 'mesero',
        email: '',
        phone: '',
        status: 'activo',
        shift: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!formData.name || !formData.email || !formData.shift) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingMember) {
      setStaff(staff.map(member => 
        member.id === editingMember.id 
          ? { ...member, ...formData }
          : member
      ));
      toast.success('Personal actualizado correctamente');
    } else {
      const newMember: StaffMember = {
        id: Math.max(...staff.map(m => m.id), 0) + 1,
        ...formData,
      };
      setStaff([...staff, newMember]);
      toast.success('Personal agregado correctamente');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteMember = (id: number) => {
    setStaff(staff.filter(member => member.id !== id));
    toast.success('Personal eliminado correctamente');
  };

  const handleChangeStatus = (id: number, newStatus: StaffStatus) => {
    setStaff(staff.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ));
    toast.success('Estado actualizado');
  };


  const filteredStaff = staff
    .filter(member => roleFilter === 'all' || member.role === roleFilter)
    .filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">Gestión de Personal</h1>
              <p className="text-sm text-muted-foreground">Administra el equipo del restaurante</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Personal
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Editar Personal' : 'Agregar Personal'}</DialogTitle>
            <DialogDescription>
              {editingMember ? 'Modifica los datos del personal' : 'Agrega un nuevo miembro al equipo'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                placeholder="Ej: Carlos Mendez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol *</Label>
              <Select value={formData.role} onValueChange={(value: StaffRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mesero">Mesero</SelectItem>
                  <SelectItem value="cocinero">Cocinero</SelectItem>
                  <SelectItem value="bartender">Bartender</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+34 600 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shift">Turno *</Label>
              <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mañana">Mañana</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noche">Noche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value: StaffStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="descanso">En Descanso</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMember}>
              {editingMember ? 'Guardar Cambios' : 'Agregar Personal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full md:max-w-sm">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={roleFilter === 'all' ? 'default' : 'outline'} onClick={() => setRoleFilter('all')}>Todos</Button>
            <Button size="sm" variant={roleFilter === 'mesero' ? 'default' : 'outline'} onClick={() => setRoleFilter('mesero')}>Meseros</Button>
            <Button size="sm" variant={roleFilter === 'cocinero' ? 'default' : 'outline'} onClick={() => setRoleFilter('cocinero')}>Cocineros</Button>
            <Button size="sm" variant={roleFilter === 'bartender' ? 'default' : 'outline'} onClick={() => setRoleFilter('bartender')}>Bartenders</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredStaff.map(member => (
            <Card key={member.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <CardHeader className="p-0 relative">
                <div className="bg-slate-100 h-24 flex items-center justify-center">
                  <UserCircle size={48} className="text-slate-400" />
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => handleOpenDialog(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteMember(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                <p className="text-sm text-primary">{roleLabels[member.role]}</p>
                <Badge variant={statusColors[member.status]} className="mt-2.5">{statusLabels[member.status]}</Badge>
              </CardContent>
              <div className="p-4 border-t text-sm text-slate-600 space-y-1.5 bg-slate-50">
                  <p><strong>Turno:</strong> {member.shift}</p>
                  <p className="truncate"><strong>Email:</strong> {member.email}</p>
                  {member.phone && <p><strong>Fono:</strong> {member.phone}</p>}
              </div>
            </Card>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Users size={40} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold">No se encontraron miembros del personal</h3>
            <p className="mt-1 text-sm">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
