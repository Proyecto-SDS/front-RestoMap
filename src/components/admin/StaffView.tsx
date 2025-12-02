'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCircle, Users, Mail, Copy, Check, UserPlus } from 'lucide-react';
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
import { toast } from 'sonner';
import { useStaff } from '@/hooks/useStaff';
import { StaffRole as BackendStaffRole, StaffStatus as BackendStaffStatus } from '@/types'; 

type StaffRole = 'mesero' | 'cocinero' | 'bartender' | 'chef' | 'anfitrion' | 'gerente';
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

export function StaffView() {
  const {
    staff: backendStaff,
    loading,
    invitationLink,
    createInvitation,
    updateStaff,
    removeStaff,
    clearInvitationLink
  } = useStaff();
  const [staff, setStaff] = useState<StaffMember[]>([]); // This will be kept in sync with backendStaff

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [invitationData, setInvitationData] = useState({
    email: '',
    rol: 'MESERO',
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    role: 'mesero' as StaffRole,
    email: '',
    phone: '',
    status: 'activo' as StaffStatus,
    shift: '',
    contrasena: '',
  });

  useEffect(() => {
    // Keep local 'staff' state in sync with 'backendStaff' from the hook
    if (backendStaff) {
      setStaff(backendStaff.map(member => ({
        id: member.id,
        name: member.nombre,
        role: member.rol.toLowerCase() as StaffRole, // Assuming backend roles are uppercase
        email: member.correo,
        phone: member.telefono || '', // Assuming phone can be null/undefined
        status: 'activo', // Backend doesn't provide status directly yet, default to 'activo'
        shift: 'No asignado', // Backend doesn't provide shift directly yet, default
      })));
    }
  }, [backendStaff]);

  const roleLabels: { [key in StaffRole]: string } = {
    mesero: 'Mesero',
    cocinero: 'Cocinero',
    bartender: 'Bartender',
    chef: 'Chef',
    anfitrion: 'Anfitrión',
    gerente: 'Gerente'
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
        contrasena: '', // Pass empty as we don't edit password here
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
        contrasena: '',
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleGenerateInvitation = async () => {
    if (!invitationData.email) {
      toast.error('Por favor ingresa un email');
      return;
    }
    if (!invitationData.rol) {
      toast.error('Por favor selecciona un rol');
      return;
    }

    const result = await createInvitation({
      email: invitationData.email,
      rol: invitationData.rol as BackendStaffRole,
    });

    if (result.success) {
      setShowInvitationDialog(true);
      toast.success('Invitación generada correctamente');
    } else {
      toast.error('Error al generar la invitación');
    }
  };

  const handleCopyLink = async () => {
    if (invitationLink && navigator.clipboard) {
      await navigator.clipboard.writeText(invitationLink);
      setLinkCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCloseInvitationDialog = () => {
    setShowInvitationDialog(false);
    clearInvitationLink();
    setInvitationData({ email: '', rol: 'MESERO' });
    setLinkCopied(false);
  };

  const handleSaveMember = async () => {
    // For editing existing members
    if (editingMember) {
      if (!formData.name || !formData.email || !formData.role) {
        toast.error('Por favor completa nombre, email y rol');
        return;
      }
      const roleMapping: Record<StaffRole, BackendStaffRole> = {
        'mesero': BackendStaffRole.MESERO,
        'cocinero': BackendStaffRole.COCINERO,
        'bartender': BackendStaffRole.BARTENDER,
        'chef': BackendStaffRole.COCINERO, // Assuming chef maps to cocinero for backend
        'anfitrion': BackendStaffRole.ANFITRION,
        'gerente': BackendStaffRole.GERENTE
      };

      const backendData = {
        nombre: formData.name,
        correo: formData.email,
        telefono: formData.phone,
        rol: roleMapping[formData.role],
      };
      
      const success = await updateStaff(editingMember.id.toString(), backendData);
      if (success) {
        toast.success('Personal actualizado correctamente');
        setIsDialogOpen(false);
      } else {
        toast.error('Error al actualizar el personal');
      }
    } else {
      // For new members, use the invitation system
      toast.info('Usa el sistema de invitaciones para agregar nuevo personal.');
      setIsDialogOpen(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('⚠️ ADVERTENCIA: ¿Estás seguro de desvincular a este empleado?\n\nPerderá acceso al sistema inmediatamente.')) {
      return;
    }
    const success = await removeStaff(id.toString());
    if (success) {
      toast.success('Personal eliminado correctamente');
    } else {
      toast.error('Error al eliminar el personal');
    }
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

      {/* Sistema de Invitaciones - CU-11 Paso 6.1 y 6.2 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Invitar Nuevo Personal</h2>
          <p className="text-sm text-slate-600">Genera un enlace de invitación único para que el nuevo empleado se registre en el sistema.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="invitation-email">Email del Empleado *</Label>
            <Input
              id="invitation-email"
              type="email"
              placeholder="email@ejemplo.com"
              value={invitationData.email}
              onChange={(e) => setInvitationData({ ...invitationData, email: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div className="flex-1">
            <Label htmlFor="invitation-role">Rol del Empleado *</Label>
            <Select value={invitationData.rol} onValueChange={(value: BackendStaffRole) => setInvitationData({ ...invitationData, rol: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mesero">Mesero</SelectItem>
                <SelectItem value="cocinero">Cocinero</SelectItem>
                <SelectItem value="bartender">Bartender</SelectItem>
                <SelectItem value="anfitrion">Anfitrión</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleGenerateInvitation} disabled={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Generar Invitación
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog para mostrar el enlace de invitación - CU-11 Paso 6.2 */}
      <Dialog open={showInvitationDialog} onOpenChange={(open) => !open && handleCloseInvitationDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enlace de Invitación Generado</DialogTitle>
            <DialogDescription>
              Comparte este enlace con el empleado para que complete su registro. El enlace expira en 7 días.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Enlace de invitación:</p>
              <p className="text-sm font-mono break-all text-slate-800">{invitationLink}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopyLink} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Enlace
              </Button>
              <Button variant="outline" onClick={handleCloseInvitationDialog}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                  <SelectItem value="chef">Chef</SelectItem>
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
            {!editingMember && (
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña para el nuevo usuario"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+56912345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="shift">Turno *</Label>
              <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })} disabled={!!editingMember}>
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
              <Select value={formData.status} onValueChange={(value: StaffStatus) => setFormData({ ...formData, status: value })} disabled={!!editingMember}>
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
                    <Button variant="destructive" size="icon" className="h-8 w-8" title="Desvincular empleado" onClick={() => handleDeleteMember(member.id)}>
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


