import { useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { TextInput } from '../inputs/TextInput';
import { Modal } from '../modals/Modal';

interface User {
  email: string;
  name: string;
  phone?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (
    nombre: string,
    telefono: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditProfileModalProps) {
  const [editForm, setEditForm] = useState({
    nombre: user.name,
    telefono: user.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    await onUpdate(editForm.nombre, editForm.telefono);
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar perfil" size="md">
      <div className="space-y-4">
        <TextInput
          label="Nombre completo"
          value={editForm.nombre}
          onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
          placeholder="Tu nombre"
        />
        <TextInput
          label="Teléfono"
          value={editForm.telefono}
          onChange={(e) =>
            setEditForm({ ...editForm, telefono: e.target.value })
          }
          placeholder="+56912345678"
        />
        <div className="bg-[#F1F5F9] rounded-lg p-3">
          <p className="text-sm text-[#64748B]">
            <strong>Correo:</strong> {user.email}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            El correo no puede ser modificado por seguridad
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <PrimaryButton
            className="flex-1"
            onClick={handleUpdate}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Guardar cambios
          </PrimaryButton>
          <SecondaryButton className="flex-1" onClick={onClose}>
            Cancelar
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
}
