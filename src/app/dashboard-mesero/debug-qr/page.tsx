'use client';

import { api } from '@/utils/apiClient';
import { useEffect, useState } from 'react';

interface QRInfo {
  id: number;
  codigo: string;
  activo: boolean;
  expiracion: string | null;
  creado_el: string | null;
  num_personas: number | null;
  id_mesa: number;
  mesa_nombre: string | null;
  id_pedido: number | null;
  pedido: {
    id: number;
    estado: string | null;
    total: number | null;
  } | null;
  id_reserva: number | null;
  id_usuario: number;
}

interface DebugQRsResponse {
  total: number;
  qrs: QRInfo[];
}

export default function DebugQRsPage() {
  const [data, setData] = useState<DebugQRsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [limpiando, setLimpiando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarQRs = async () => {
    setLoading(true);
    try {
      const response = await api.empresa.getDebugQRs();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar QRs');
    } finally {
      setLoading(false);
    }
  };

  const limpiarQRs = async () => {
    setLimpiando(true);
    setMensaje(null);
    try {
      const response = await api.empresa.limpiarQRsHuerfanos();
      setMensaje(response.message);
      // Recargar los QRs despues de limpiar
      await cargarQRs();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'Error al limpiar QRs');
    } finally {
      setLimpiando(false);
    }
  };

  useEffect(() => {
    cargarQRs();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Debug QRs</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Debug QRs</h1>
        <p className="text-red-500">{error}</p>
        <button
          onClick={cargarQRs}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Debug QRs ({data?.total || 0})</h1>
        <div className="flex gap-2">
          <button
            onClick={limpiarQRs}
            disabled={limpiando}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {limpiando ? 'Limpiando...' : 'Limpiar QRs Huerfanos'}
          </button>
          <button
            onClick={cargarQRs}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refrescar
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {mensaje}
        </div>
      )}

      <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
        <p className="text-sm">
          <strong>Leyenda:</strong>
          <span className="ml-2 px-2 py-1 bg-green-200 rounded">Activo</span>
          <span className="ml-2 px-2 py-1 bg-red-200 rounded">Inactivo</span>
          <span className="ml-2 px-2 py-1 bg-blue-200 rounded">Con Pedido</span>
          <span className="ml-2 px-2 py-1 bg-gray-200 rounded">Sin Pedido</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left">ID</th>
              <th className="px-4 py-2 border text-left">Codigo</th>
              <th className="px-4 py-2 border text-left">Activo</th>
              <th className="px-4 py-2 border text-left">Mesa</th>
              <th className="px-4 py-2 border text-left">Pedido ID</th>
              <th className="px-4 py-2 border text-left">Estado Pedido</th>
              <th className="px-4 py-2 border text-left">Expiracion</th>
              <th className="px-4 py-2 border text-left">Creado</th>
              <th className="px-4 py-2 border text-left">Personas</th>
            </tr>
          </thead>
          <tbody>
            {data?.qrs.map((qr) => (
              <tr
                key={qr.id}
                className={`${
                  qr.activo ? 'bg-green-50' : 'bg-red-50'
                } hover:bg-gray-100`}
              >
                <td className="px-4 py-2 border">{qr.id}</td>
                <td className="px-4 py-2 border font-mono text-sm">
                  {qr.codigo}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      qr.activo
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {qr.activo ? 'SI' : 'NO'}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {qr.mesa_nombre} (ID: {qr.id_mesa})
                </td>
                <td className="px-4 py-2 border">
                  {qr.id_pedido ? (
                    <span className="px-2 py-1 bg-blue-200 rounded">
                      {qr.id_pedido}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {qr.pedido ? (
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        qr.pedido.estado === 'cancelado'
                          ? 'bg-red-200'
                          : qr.pedido.estado === 'completado'
                          ? 'bg-gray-200'
                          : 'bg-blue-200'
                      }`}
                    >
                      {qr.pedido.estado}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2 border text-sm">
                  {qr.expiracion
                    ? new Date(qr.expiracion).toLocaleString('es-CL')
                    : '-'}
                </td>
                <td className="px-4 py-2 border text-sm">
                  {qr.creado_el
                    ? new Date(qr.creado_el).toLocaleString('es-CL')
                    : '-'}
                </td>
                <td className="px-4 py-2 border text-center">
                  {qr.num_personas ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.qrs.length === 0 && (
        <p className="text-center text-gray-500 py-8">No hay QRs registrados</p>
      )}
    </div>
  );
}
