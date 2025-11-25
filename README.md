# Frontend - ReservaYa

Aplicación frontend basada en Next.js 16 + React 19 + TypeScript para el sistema de reservas de locales.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Configuración](#configuración)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)

## Requisitos

- Node.js 20.x o superior
- npm o yarn
- Backend corriendo en http://localhost:5000

## Configuración

### Variables de Entorno

Copia el archivo `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_token_de_mapbox
```

## Instalación

```bash
# Instalar dependencias
npm install
```

## Scripts Disponibles

```bash
# Desarrollo (hot-reload en http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linter
npm run lint
```

## Tecnologías

### Core

- **Next.js** 16.0.4 - Framework React con SSR
- **React** 19.2.0 - Librería UI
- **TypeScript** 5.9.3 - Tipado estático

### UI Components

- **Radix UI** - Componentes accesibles sin estilos
- **shadcn/ui** - Sistema de componentes
- **Tailwind CSS** 4.x - CSS utility-first
- **Lucide React** - Iconos

### Maps

- **Mapbox GL** 3.16.0 - Mapas interactivos

### Forms & State

- **React Hook Form** 7.55.0 - Manejo de formularios
- **Next Themes** 0.4.6 - Tema claro/oscuro

### Charts

- **Recharts** 2.15.2 - Gráficos y visualizaciones

## Diseño

El diseño está basado en el Design System de Figma:  
https://www.figma.com/design/wTlXgTLgOZIRba5oUvNODU/Design-System-for-ReservaYa

## API Client

El cliente de API (`src/utils/apiClient.ts`) maneja todas las peticiones al backend Flask:

- Autenticación (login, register, logout)
- Perfil de usuario
- Establecimientos (listado, detalle, horarios, fotos, menú)
- Opiniones (listado, crear)
- Reservas (disponibilidad, crear)
- Comunas

## Problemas Comunes

### Error de conexión con el backend

Verifica que:

1. El backend esté corriendo en `http://localhost:5000`
2. La variable `NEXT_PUBLIC_API_URL` esté configurada correctamente
3. CORS esté habilitado en el backend (Flask-CORS)

### Error con Mapbox

Asegúrate de tener un token válido de Mapbox en `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

### Errores de TypeScript

```bash
# Limpiar cache de TypeScript
rm -rf .next
npm run dev
```

## Contacto

Para dudas o sugerencias, contacta al equipo de desarrollo.
