# 🍽️ ReservaYa - Aplicación de Reservas de Restaurantes

Aplicación móvil web para buscar restaurantes, hacer reservas con pre-orden de comida y generar códigos QR para mostrar al llegar.

## 📱 Características Principales

- ✅ **Sistema de Autenticación** - Login y registro con recuperación de contraseña
- 🗺️ **Mapa Interactivo** - Búsqueda de restaurantes por ubicación o nombre
- 📋 **Detalles de Restaurante** - Información completa, menú y sistema de favoritos
- 🍴 **Pre-orden de Comida** - Selección de platos antes de llegar
- 📱 **Código QR** - Generación de QR real y descargable para confirmar reservas
- ⭐ **Favoritos** - Guarda tus restaurantes preferidos
- 📅 **Mis Reservas** - Historial completo de reservas activas y pasadas
- 👤 **Perfil de Usuario** - Menú con configuración y gestión de cuenta

## 🎨 Sistema de Colores

La aplicación utiliza una paleta cálida y gastronómica:

- **Naranja Principal**: `#FF6B35` - Acción y energía
- **Amarillo Dorado**: `#FFD23F` - Calidez y apetito
- **Verde Fresco**: `#27AE60` - Confirmación y éxito
- **Rojo Pasión**: `#E74C3C` - Urgencia y destacados
- **Crema Suave**: `#FFF8E7` - Fondos cálidos
- **Gris Oscuro**: `#2C3E50` - Textos y contraste

Ver documentación completa en `/COLOR_SYSTEM.md`

## 🏗️ Estructura del Proyecto

```
/
├── App.tsx                          # Componente principal y enrutamiento
├── components/
│   ├── LoginScreen.tsx              # Pantalla de inicio de sesión
│   ├── RegisterScreen.tsx           # Pantalla de registro
│   ├── MapScreen.tsx                # Mapa principal con restaurantes
│   ├── RestaurantDetails.tsx        # Detalles y menú del restaurante
│   ├── QRConfirmation.tsx           # Confirmación con código QR
│   ├── ReservationsScreen.tsx       # Historial de reservas
│   ├── FavoritesScreen.tsx          # Restaurantes favoritos
│   ├── UserMenu.tsx                 # Menú de usuario
│   ├── Logo.tsx                     # Logo de la aplicación
│   └── ui/                          # Componentes de ShadCN UI
├── styles/
│   └── globals.css                  # Estilos globales y tokens
└── COLOR_SYSTEM.md                  # Documentación de paleta de colores
```

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos y diseño
- **ShadCN UI** - Componentes de interfaz
- **Lucide React** - Iconografía
- **React QR Code** - Generación de códigos QR
- **Sonner** - Notificaciones toast
- **Leaflet** - Mapas interactivos

## 📦 Dependencias Principales

```json
{
  "react": "^18.x",
  "lucide-react": "latest",
  "react-qr-code": "latest",
  "react-leaflet": "latest",
  "leaflet": "latest",
  "sonner": "^2.0.3"
}
```

## 🚀 Instalación y Configuración

### Desde Figma Make:
1. Abre el proyecto en Figma Make
2. Haz clic en "Share" o "Export"
3. Selecciona tu opción preferida (CodeSandbox, Stackblitz, ZIP)

### Instalación Local:
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📖 Guía de Uso

### Flujo de Usuario:

1. **Login/Registro** → Usuario inicia sesión o crea cuenta
2. **Mapa Principal** → Busca restaurantes cercanos o por nombre
3. **Detalles** → Ve información, menú, fotos y reseñas
4. **Hacer Reserva** → Selecciona fecha, hora, personas y pre-orden
5. **Confirmación QR** → Recibe código QR descargable
6. **Mis Reservas** → Accede al historial y códigos QR guardados

### Gestión de Favoritos:
- Toca el ícono de corazón en cualquier restaurante
- Accede a la lista desde el menú de usuario
- Elimina favoritos deslizando hacia la izquierda

### Sistema de Reservas:
- Las reservas se guardan automáticamente al confirmar
- Códigos QR reales y escaneables
- Descarga o comparte el QR con otros
- Historial completo con estados (confirmada, completada, cancelada)

## 🎨 Personalización

### Cambiar Colores:
Edita los tokens en `/styles/globals.css`:

```css
:root {
  --primary-orange: #FF6B35;
  --primary-yellow: #FFD23F;
  --success-green: #27AE60;
  /* ... más colores */
}
```

### Agregar Nuevos Restaurantes:
Edita el array `mockRestaurants` en `MapScreen.tsx`:

```tsx
const mockRestaurants = [
  {
    id: number,
    name: string,
    cuisine: string,
    rating: number,
    position: [lat, lng],
    // ... más propiedades
  }
];
```

## 🔐 Datos de Prueba

### Usuario de Prueba:
- **Email**: `demo@reservaya.com`
- **Contraseña**: `Demo123!`

### Características de Demo:
- Sistema de autenticación simulado
- Datos guardados en localStorage
- 10 restaurantes de ejemplo
- Pre-órdenes y reservas persistentes

## 🌟 Características Avanzadas

### Códigos QR:
- Generación real usando `react-qr-code`
- Nivel de corrección: Alto (H)
- Contiene: ID, restaurante, fecha, hora, personas
- Descarga como PNG de 1000x1000px
- Compartir vía API nativa o portapapeles

### Mapas:
- Integración con Leaflet
- Marcadores personalizados
- Búsqueda por ubicación
- Filtros por tipo de cocina

### Persistencia:
- LocalStorage para autenticación
- Favoritos sincronizados
- Historial de reservas
- Carrito de pre-orden

## 📝 Notas de Desarrollo

- Componentes modulares y reutilizables
- Sistema de diseño consistente
- Responsive (móvil primero)
- Accesibilidad con componentes ShadCN
- Código limpio y documentado

## 🤝 Contribuir

Para colaborar en este proyecto:

1. Exporta el código desde Figma Make
2. Crea un fork del proyecto
3. Realiza tus cambios
4. Documenta nuevas funcionalidades
5. Comparte los cambios con el equipo

## 📄 Licencia

Proyecto creado con Figma Make para fines educativos y de demostración.

## 📧 Contacto

Para dudas o sugerencias sobre el proyecto ReservaYa.

---

**Creado con ❤️ en Figma Make**
