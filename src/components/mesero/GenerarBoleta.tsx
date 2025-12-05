import { Check, Download, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Mesa, Pedido } from '../../screens/mesero/DashboardMeseroScreen';
import { User } from '../../types';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface GenerarBoletaProps {
  mesas: Mesa[];
  pedidos: Pedido[];
  user?: User | null;
  onPedidoUpdate: (pedido: Pedido) => void;
  onMesaUpdate: (mesa: Mesa) => void;
}

type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';

export function GenerarBoleta({
  mesas,
  pedidos,
  user,
  onPedidoUpdate,
  onMesaUpdate,
}: GenerarBoletaProps) {
  const [selectedMesaId, setSelectedMesaId] = useState<string>('');
  const [mesaPedidos, setMesaPedidos] = useState<Pedido[]>([]);
  const [selectedPedidoIds, setSelectedPedidoIds] = useState<Set<string>>(
    new Set()
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const IVA_RATE = 0.19; // 19% IVA Chile

  // Filter mesas that have orders
  const mesasWithOrders = mesas.filter((mesa) =>
    [
      'OCUPADA',
      'PIDIENDO',
      'EN_COCINA',
      'COMIENDO',
      'PIDIENDO_CUENTA',
    ].includes(mesa.estado)
  );

  // Load pedidos for selected mesa
  useEffect(() => {
    if (selectedMesaId) {
      const filteredPedidos = pedidos.filter(
        (p) =>
          p.id_mesa === selectedMesaId &&
          ['TOMADO', 'EN_COCINA', 'LISTO', 'ENTREGADO'].includes(p.estado)
      );
      setMesaPedidos(filteredPedidos);
      // Pre-select all pedidos
      setSelectedPedidoIds(new Set(filteredPedidos.map((p) => p.id)));
    } else {
      setMesaPedidos([]);
      setSelectedPedidoIds(new Set());
    }
  }, [selectedMesaId, pedidos]);

  // Calculate totals
  const calculateTotals = () => {
    const selectedPedidos = mesaPedidos.filter((p) =>
      selectedPedidoIds.has(p.id)
    );
    const subtotal = selectedPedidos.reduce((sum, p) => sum + p.total, 0);
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    return { subtotal, iva, total };
  };

  const { subtotal, iva, total } = calculateTotals();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Toggle pedido selection
  const togglePedidoSelection = (pedidoId: string) => {
    const newSet = new Set(selectedPedidoIds);
    if (newSet.has(pedidoId)) {
      newSet.delete(pedidoId);
    } else {
      newSet.add(pedidoId);
    }
    setSelectedPedidoIds(newSet);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle generate PDF
  const handleGeneratePDF = () => {
    showToast('info', 'Generando PDF... (mock)');
    // In production: generate PDF with library like jsPDF
  };

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (selectedPedidoIds.size === 0) {
      showToast('error', 'Selecciona al menos un pedido');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - Update pedidos to PAGADO
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update all selected pedidos
      mesaPedidos.forEach((pedido) => {
        if (selectedPedidoIds.has(pedido.id)) {
          onPedidoUpdate({
            ...pedido,
            estado: 'PAGADO',
          });
        }
      });

      // Update mesa to DISPONIBLE if all pedidos are paid
      const mesa = mesas.find((m) => m.id === selectedMesaId);
      if (mesa) {
        onMesaUpdate({
          ...mesa,
          estado: 'DISPONIBLE',
          pedidos_count: 0,
        });
      }

      showToast('success', '¡Pago registrado correctamente!');

      // Reset form
      setTimeout(() => {
        setSelectedMesaId('');
        setMesaPedidos([]);
        setSelectedPedidoIds(new Set());
        setPaymentMethod('EFECTIVO');
        setAmountReceived('');
      }, 1500);
    } catch {
      showToast('error', 'Error al registrar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate change
  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    return received - total;
  };

  const change = calculateChange();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#334155] mb-2">Generar Boleta</h1>
        <p className="text-[#64748B]">
          Selecciona una mesa y sus pedidos para generar la boleta de pago
        </p>
      </div>

      {/* Mesa Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <label className="block text-sm text-[#334155] mb-2">
          Selecciona mesa
        </label>
        <select
          value={selectedMesaId}
          onChange={(e) => setSelectedMesaId(e.target.value)}
          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
        >
          <option value="">-- Selecciona una mesa --</option>
          {mesasWithOrders.map((mesa) => (
            <option key={mesa.id} value={mesa.id}>
              {mesa.nombre} - {mesa.estado.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {selectedMesaId && mesaPedidos.length > 0 && (
        <>
          {/* Pedidos Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="text-[#334155] mb-4">Pedidos de la mesa</h3>
            <div className="space-y-3">
              {mesaPedidos.map((pedido) => (
                <label
                  key={pedido.id}
                  className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-lg cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPedidoIds.has(pedido.id)}
                    onChange={() => togglePedidoSelection(pedido.id)}
                    className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[#334155]">Orden #{pedido.id}</p>
                    <p className="text-xs text-[#64748B]">
                      {pedido.lineas?.length || 0} items
                    </p>
                  </div>
                  <p className="text-sm text-[#F97316]">
                    {formatCurrency(pedido.total)}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Bill Preview */}
          <div
            className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6"
            id="bill-preview"
          >
            <div className="border-b border-[#E2E8F0] pb-4 mb-4">
              <h2 className="text-xl text-[#334155] mb-1">
                {user?.nombre_local || 'Establecimiento'}
              </h2>
              <p className="text-sm text-[#64748B]">Boleta de consumo</p>

              <p className="text-xs text-[#94A3B8] mt-2">
                {new Date().toLocaleString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm text-[#64748B] mb-3">Detalles</h3>
              {mesaPedidos
                .filter((p) => selectedPedidoIds.has(p.id))
                .map((pedido) => (
                  <div key={pedido.id} className="space-y-1">
                    {pedido.lineas?.map((linea) => (
                      <div
                        key={linea.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-[#334155]">
                          {linea.cantidad}x {linea.producto_nombre}
                        </span>
                        <span className="text-[#64748B]">
                          {formatCurrency(
                            linea.cantidad * linea.precio_unitario
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Subtotal</span>
                <span className="text-[#334155]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">IVA (19%)</span>
                <span className="text-[#334155]">{formatCurrency(iva)}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-[#E2E8F0] pt-2">
                <span className="text-[#334155]">Total</span>
                <span className="text-[#F97316]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="text-[#334155] mb-4">Método de pago</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(
                [
                  'EFECTIVO',
                  'TARJETA',
                  'TRANSFERENCIA',
                  'OTRO',
                ] as PaymentMethod[]
              ).map((method) => (
                <label
                  key={method}
                  className={`
                    flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${
                      paymentMethod === method
                        ? 'border-[#F97316] bg-[#FFF7ED]'
                        : 'border-[#E2E8F0] hover:border-[#F97316]/30'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="sr-only"
                  />
                  <span
                    className={`text-sm ${
                      paymentMethod === method
                        ? 'text-[#F97316]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {method.charAt(0) + method.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>

            {/* Amount received for cash */}
            {paymentMethod === 'EFECTIVO' && (
              <div className="space-y-2">
                <label className="block text-sm text-[#334155]">
                  Monto recibido (opcional)
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
                {amountReceived && change >= 0 && (
                  <p className="text-sm text-[#22C55E]">
                    Vuelto: {formatCurrency(change)}
                  </p>
                )}
                {amountReceived && change < 0 && (
                  <p className="text-sm text-[#EF4444]">
                    Falta: {formatCurrency(Math.abs(change))}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SecondaryButton onClick={handlePrint} className="flex-1">
              <Printer size={16} />
              Imprimir Boleta
            </SecondaryButton>

            <SecondaryButton onClick={handleGeneratePDF} className="flex-1">
              <Download size={16} />
              Generar PDF
            </SecondaryButton>

            <PrimaryButton
              onClick={handleMarkAsPaid}
              isLoading={isLoading}
              disabled={isLoading || selectedPedidoIds.size === 0}
              className="flex-1"
            >
              <Check size={16} />
              Marcar como Pagado
            </PrimaryButton>
          </div>
        </>
      )}

      {selectedMesaId && mesaPedidos.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <p className="text-[#94A3B8]">
            Esta mesa no tiene pedidos pendientes
          </p>
        </div>
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
