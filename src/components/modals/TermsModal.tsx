'use client';

import { Modal } from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'persona' | 'empresa';
}

export function TermsModal({ isOpen, onClose, type }: TermsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terminos y Condiciones"
      size="lg"
    >
      <div className="prose prose-sm max-w-none text-[#334155]">
        {type === 'persona' ? (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Terminos y Condiciones de Uso - RestoMap
            </h3>
            <p className="text-sm text-[#64748B] mb-4">
              Ultima actualizacion: Diciembre 2024 - Version 1.0
            </p>

            <h4 className="font-semibold mt-4 mb-2">
              1. Aceptacion de los Terminos
            </h4>
            <p className="text-sm mb-3">
              Al registrarte y utilizar RestoMap, aceptas estos terminos y
              condiciones que regulan el uso de nuestra plataforma de reservas y
              descubrimiento de restaurantes.
            </p>

            <h4 className="font-semibold mt-4 mb-2">2. Uso del Servicio</h4>
            <p className="text-sm mb-3">
              RestoMap te permite buscar restaurantes, realizar reservas y
              consultar menus. Te comprometes a proporcionar informacion veraz y
              a utilizar el servicio de manera responsable.
            </p>

            <h4 className="font-semibold mt-4 mb-2">3. Reservas</h4>
            <p className="text-sm mb-3">
              Las reservas realizadas a traves de RestoMap estan sujetas a
              disponibilidad. Nos reservamos el derecho de cancelar reservas que
              no cumplan con las politicas del establecimiento.
            </p>

            <h4 className="font-semibold mt-4 mb-2">4. Privacidad</h4>
            <p className="text-sm mb-3">
              Tu informacion personal sera tratada conforme a nuestra Politica
              de Privacidad. No compartiremos tus datos con terceros sin tu
              consentimiento expreso.
            </p>

            <h4 className="font-semibold mt-4 mb-2">5. Responsabilidades</h4>
            <p className="text-sm mb-3">
              RestoMap actua como intermediario entre usuarios y
              establecimientos. No somos responsables por la calidad del
              servicio prestado por los restaurantes.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Terminos y Condiciones para Establecimientos - RestoMap
            </h3>
            <p className="text-sm text-[#64748B] mb-4">
              Ultima actualizacion: Diciembre 2024 - Version 1.0
            </p>

            <h4 className="font-semibold mt-4 mb-2">
              1. Aceptacion del Contrato
            </h4>
            <p className="text-sm mb-3">
              Al registrar su establecimiento en RestoMap, usted acepta estos
              terminos que constituyen un contrato de servicio entre su empresa
              y nuestra plataforma.
            </p>

            <h4 className="font-semibold mt-4 mb-2">2. Requisitos Legales</h4>
            <p className="text-sm mb-3">
              El establecimiento declara estar legalmente constituido en Chile,
              contar con RUT vigente y cumplir con todas las normativas
              aplicables al rubro gastronomico.
            </p>

            <h4 className="font-semibold mt-4 mb-2">
              3. Responsabilidad por Empleados
            </h4>
            <p className="text-sm mb-3">
              El establecimiento es responsable de todos los usuarios empleados
              registrados en su cuenta, incluyendo las acciones realizadas por
              estos dentro de la plataforma. Se compromete a:
            </p>
            <ul className="text-sm list-disc pl-6 mb-3">
              <li>Autorizar solo a personal de confianza</li>
              <li>Desactivar cuentas de empleados cesados en 24 horas</li>
              <li>No compartir credenciales entre multiples personas</li>
              <li>Capacitar al personal en el uso correcto del sistema</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">4. Gestion de Reservas</h4>
            <p className="text-sm mb-3">
              El establecimiento se compromete a honrar las reservas confirmadas
              y a mantener actualizada la disponibilidad de mesas en el sistema.
            </p>

            <h4 className="font-semibold mt-4 mb-2">5. Informacion Veraz</h4>
            <p className="text-sm mb-3">
              Toda la informacion proporcionada (menus, precios, horarios) debe
              ser veraz y mantenerse actualizada. RestoMap no se responsabiliza
              por informacion incorrecta proporcionada por el establecimiento.
            </p>

            <h4 className="font-semibold mt-4 mb-2">6. Proteccion de Datos</h4>
            <p className="text-sm mb-3">
              El establecimiento se compromete a proteger los datos de los
              clientes obtenidos a traves de la plataforma, utilizandolos
              unicamente para los fines del servicio.
            </p>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
}
