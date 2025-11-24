# 🍽️ Restaurant Reservation App - Instrucciones de Instalación

## 📦 Contenido del Proyecto

Este es el código completo de la aplicación de reservas de restaurantes con:
- ✅ Mapa interactivo de Mapbox integrado
- ✅ Sistema de reservas
- ✅ Gestión de favoritos
- ✅ Menú de restaurantes
- ✅ Confirmación con código QR

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js v16 o superior
- npm o yarn

### Pasos de Instalación

1. **Extraer el archivo ZIP**
   - Descomprime el archivo en la ubicación deseada

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Mapbox (Opcional)**
   - El archivo `.env` ya incluye la API key de Mapbox
   - Si deseas usar tu propia key, edita el archivo `.env`:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=tu_api_key_aqui
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   - La aplicación se abrirá automáticamente en `http://localhost:3000`
   - O abre manualmente esa URL en tu navegador

## 📁 Estructura del Proyecto

```
Restaurant Reservation App/
├── src/
│   ├── components/        # Componentes React
│   │   ├── MapScreen.tsx  # Mapa con Mapbox
│   │   ├── RestaurantDetails.tsx
│   │   ├── FavoritesScreen.tsx
│   │   └── ui/           # Componentes de UI
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada
├── public/               # Archivos estáticos
├── .env                  # Variables de entorno (Mapbox API)
├── package.json          # Dependencias
└── vite.config.ts        # Configuración de Vite

```

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción

## 🗺️ API de Mapbox

La aplicación usa Mapbox para mostrar mapas interactivos:
- **Token incluido**: Ya está configurado en `.env`
- **Ubicación**: Lima, Perú (coordenadas configuradas)
- **Marcadores**: 3 restaurantes de ejemplo

## 📱 Características

1. **Pantalla de Login/Registro**
2. **Mapa Interactivo** - Busca restaurantes cercanos
3. **Detalles de Restaurante** - Ver menú, horarios, valoraciones
4. **Sistema de Reservas** - Selecciona fecha, hora y personas
5. **Código QR** - Confirmación de reserva
6. **Favoritos** - Guarda tus restaurantes preferidos
7. **Mis Reservas** - Historial de reservas

## 🎨 Personalización

### Cambiar Restaurantes
Edita `src/components/MapScreen.tsx`:
```typescript
const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Tu Restaurante",
    coordinates: [-77.0428, -12.0464], // [longitud, latitud]
    // ... más propiedades
  }
];
```

### Cambiar Colores
Edita `src/index.css` o los archivos en `src/styles/`

## ❓ Problemas Comunes

### El servidor no inicia
```bash
# Elimina node_modules e instala de nuevo
rm -rf node_modules
npm install
npm run dev
```

### Error con Mapbox
- Verifica que el archivo `.env` existe
- Confirma que la API key es válida
- Reinicia el servidor después de cambiar `.env`

## 📞 Soporte

Para problemas o preguntas, revisa:
- Los archivos README adicionales en `/src`
- La documentación de componentes
- Los comentarios en el código

## 🔧 Tecnologías Usadas

- **React 18** - Framework UI
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool
- **Mapbox GL** - Mapas interactivos
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos

---

**¡Disfruta desarrollando! 🚀**
