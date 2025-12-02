"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

// --- TIPOS DE DATOS (Listos para tu DB) ---
interface Ingrediente {
  id: string;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  ingredientes: string[]; // O Array<Ingrediente> si tienes una tabla aparte
  categoria: string;
}

interface CartItem extends Producto {
  cantidad: number;
  comentario?: string;
}

// --- BASE DE DATOS SIMULADA (Aquí conectarás tu API después) ---
const PRODUCTOS_DB: Producto[] = [
  {
    id: 1,
    nombre: "Paella Valenciana",
    descripcion: "Arroz con mariscos frescos del día",
    precio: 18.5,
    imagen: "/images/paella.jpg", // Asegúrate de tener estas imágenes en public/images
    ingredientes: [
      "Arroz",
      "Camarones",
      "Mejillones",
      "Calamares",
      "Azafrán",
      "Guisantes",
    ],
    categoria: "Platos Fuertes",
  },
  {
    id: 2,
    nombre: "Tacos al Pastor",
    descripcion: "Tacos tradicionales con carne marinada",
    precio: 12.0,
    imagen: "/images/tacos.jpg",
    ingredientes: [
      "Tortilla de maíz",
      "Carne de cerdo",
      "Piña",
      "Cilantro",
      "Cebolla",
      "Salsa",
    ],
    categoria: "Tacos",
  },
  {
    id: 3,
    nombre: "Ensalada César",
    descripcion: "Lechuga romana fresca con aderezo casero",
    precio: 10.5,
    imagen: "/images/ensalada.jpg",
    ingredientes: ["Lechuga", "Crutones", "Queso Parmesano", "Pollo"],
    categoria: "Entradas",
  },
];

export default function VistaMenuUsuario() {
  // --- ESTADOS ---
  const [menuItems, setMenuItems] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- EFECTO: CARGAR DATOS (Simulación de Fetch a DB) ---
  useEffect(() => {
    // AQUÍ harías: const data = await fetch('/api/productos');
    // Por ahora usamos la data mockeada:
    setMenuItems(PRODUCTOS_DB);
  }, []);

  // --- LÓGICA DEL CARRITO ---

  // Abrir modal para añadir
  const handleOpenModal = (producto: Producto) => {
    setSelectedProduct(producto);
    setComment("");
    setIsModalOpen(true);
  };

  // Confirmar añadir al carrito desde el modal
  const addToCart = () => {
    if (!selectedProduct) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === selectedProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.id === selectedProduct.id
            ? { ...item, cantidad: item.cantidad + 1, comentario: comment } // Actualiza comentario si se desea
            : item
        );
      }
      return [
        ...prev,
        { ...selectedProduct, cantidad: 1, comentario: comment },
      ];
    });
    setIsModalOpen(false);
  };

  // Incrementar/Decrementar desde el sidebar
  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, cantidad: Math.max(0, item.cantidad + delta) };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const total = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 flex flex-col md:flex-row">
      {/* --- COLUMNA IZQUIERDA: MENÚ (Grid) --- */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header simple */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-orange-100 rounded border border-orange-200 flex items-center justify-center">
              <span className="text-orange-600 font-bold">R</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">ReservaYa</h1>
              <p className="text-xs text-gray-500">
                Encuentra y reserva tu mesa favorita
              </p>
            </div>
          </div>
          <ShoppingCart className="md:hidden text-gray-600" />
        </header>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {menuItems.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Imagen del producto */}
              <div className="relative h-48 w-full bg-gray-200">
                {/* Usar componente Image de Next.js en producción */}
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {producto.nombre}
                  </h3>
                  <span className="text-orange-500 font-bold text-lg">
                    ${producto.precio.toFixed(2)}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {producto.descripcion}
                </p>

                {/* Ingredientes (Tags) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {producto.ingredientes.slice(0, 3).map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full"
                    >
                      {ing}
                    </span>
                  ))}
                  {producto.ingredientes.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                      +{producto.ingredientes.length - 3}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenModal(producto)}
                  className="mt-auto w-full bg-[#FF452B] hover:bg-[#e03e26] text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Agregar al pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- COLUMNA DERECHA: TU ORDEN (Sidebar) --- */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col h-[calc(100vh-0px)] sticky top-0">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-xl">Tu Orden</h2>
          <X className="w-5 h-5 text-gray-400 cursor-pointer md:hidden" />
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">
              Tu carrito está vacío.
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-semibold text-sm">{item.nombre}</h4>
                    <span className="text-orange-500 font-bold text-sm">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-orange-500 mb-2">
                    ${item.precio.toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full border border-orange-500 text-orange-500 flex items-center justify-center hover:bg-orange-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold text-sm">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full bg-[#FF452B] text-white flex items-center justify-center hover:bg-[#e03e26]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Carrito */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-orange-500">
              ${total.toFixed(2)}
            </span>
          </div>
          <button className="w-full bg-[#FF452B] hover:bg-[#e03e26] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all">
            Confirmar Orden
          </button>
        </div>
      </div>

      {/* --- MODAL: AÑADIR COMENTARIO (Overlay) --- */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl">Añadir Comentario</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold">
                  {selectedProduct.nombre}
                </h4>
                <p className="text-orange-500 font-bold">
                  ${selectedProduct.precio.toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Ingredientes:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.ingredientes.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Añade un comentario para este plato... (ej. Sin cebolla)"
                className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={addToCart}
                className="w-full bg-[#FF452B] hover:bg-[#e03e26] text-white py-3 rounded-xl font-bold transition-colors"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
