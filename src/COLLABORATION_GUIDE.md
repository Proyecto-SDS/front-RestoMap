# 👥 Guía de Colaboración - ReservaYa

Guía rápida para que tu equipo pueda trabajar juntos en el proyecto.

## 🚀 Inicio Rápido

### Para el Creador (tú):

1. **Comparte el proyecto:**
   - Busca el botón **"Share"** en Figma Make (esquina superior derecha)
   - Cambia los permisos a **"Anyone with the link can edit"**
   - Copia y comparte el link con tu equipo

2. **O exporta el código:**
   - Clic en menú **⋮** → **"Export"** → **"Download ZIP"**
   - Comparte el archivo ZIP
   - O súbelo a GitHub/GitLab

---

### Para Colaboradores:

1. **Accede al link compartido**
2. **Haz clic en "Remix"** o **"Fork"** para crear tu copia
3. **Edita** lo que necesites
4. **Comparte** tus cambios con el equipo

---

## 🎯 Roles y Permisos

### Administrador (Creador):
- ✅ Edita todo el proyecto
- ✅ Gestiona colaboradores
- ✅ Publica versiones
- ✅ Configura deploy

### Editor (Colaboradores):
- ✅ Edita archivos
- ✅ Crea componentes
- ✅ Modifica estilos
- ⚠️ No puede eliminar el proyecto

### Viewer (Solo lectura):
- ✅ Ve el código
- ✅ Copia snippets
- ❌ No puede editar

---

## 📁 Estructura de Archivos

### 🔴 NO MODIFICAR (Archivos del sistema):
```
/components/figma/ImageWithFallback.tsx
/components/ui/* (componentes ShadCN, mejor no tocar)
```

### 🟡 MODIFICAR CON CUIDADO:
```
/App.tsx (lógica principal)
/styles/globals.css (estilos base)
```

### 🟢 LIBRE PARA EDITAR:
```
/components/LoginScreen.tsx
/components/MapScreen.tsx
/components/RestaurantDetails.tsx
/components/QRConfirmation.tsx
/components/ReservationsScreen.tsx
/components/FavoritesScreen.tsx
/components/UserMenu.tsx
/components/RegisterScreen.tsx
/components/Logo.tsx
/COLOR_SYSTEM.md
/README.md
```

---

## 🎨 Tareas Comunes

### 1. Modificar Colores

**Archivo:** `/styles/globals.css`

```css
:root {
  --primary-orange: #FF6B35;  /* Cambia aquí */
  --primary-yellow: #FFD23F;
  --success-green: #27AE60;
}
```

**Documenta en:** `/COLOR_SYSTEM.md`

---

### 2. Agregar Nuevo Restaurante

**Archivo:** `/components/MapScreen.tsx`

Busca el array `mockRestaurants` y agrega:

```tsx
{
  id: 11,
  name: "Tu Restaurante",
  cuisine: "Tipo de cocina",
  rating: 4.5,
  position: [-12.0464, -77.0428],
  priceRange: "$$",
  image: "URL_de_imagen",
}
```

---

### 3. Modificar el Logo

**Archivo:** `/components/Logo.tsx`

Edita el SVG manteniendo las proporciones:

```tsx
<svg width={size} height={size} viewBox="0 0 120 120">
  {/* Tu diseño aquí */}
</svg>
```

---

### 4. Agregar Nueva Pantalla

1. **Crea el archivo:**
   ```
   /components/MiNuevaPantalla.tsx
   ```

2. **Estructura básica:**
   ```tsx
   import { Button } from "./ui/button";
   
   export function MiNuevaPantalla({ onBack }: { onBack: () => void }) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
         <div className="p-6">
           <h1>Mi Nueva Pantalla</h1>
           <Button onClick={onBack}>Volver</Button>
         </div>
       </div>
     );
   }
   ```

3. **Agrégala en App.tsx:**
   ```tsx
   import { MiNuevaPantalla } from "./components/MiNuevaPantalla";
   
   // En el switch de screens:
   case "miNuevaPantalla":
     return <MiNuevaPantalla onBack={() => setScreen("map")} />;
   ```

---

### 5. Modificar Menú del Usuario

**Archivo:** `/components/UserMenu.tsx`

Busca el array `menuItems` y agrega:

```tsx
{
  icon: TuIcono,
  label: "Nueva Opción",
  color: "text-orange-600",
  bgColor: "bg-orange-50",
  onClick: () => {
    // Tu lógica aquí
  }
}
```

---

## 🔄 Flujo de Trabajo

### Método Simple (Figma Make):

1. **Abre el proyecto** compartido
2. **Edita** directamente
3. Los cambios **se guardan automáticamente**
4. **Comunica** al equipo qué modificaste

### Método Profesional (Git):

1. **Clona el repo:**
   ```bash
   git clone URL_DEL_REPO
   cd reservaya
   ```

2. **Crea una rama:**
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```

3. **Haz cambios y guarda:**
   ```bash
   git add .
   git commit -m "Descripción clara de los cambios"
   ```

4. **Sube los cambios:**
   ```bash
   git push origin feature/nombre-descriptivo
   ```

5. **Crea Pull Request** en GitHub/GitLab

6. **Espera revisión** del equipo

7. **Merge** después de aprobación

---

## ✅ Checklist Antes de Compartir Cambios

- [ ] El código funciona sin errores
- [ ] Los estilos se ven bien (móvil y desktop)
- [ ] No rompiste funcionalidades existentes
- [ ] Agregaste comentarios en código complejo
- [ ] Actualizaste README.md si agregaste funcionalidad
- [ ] Probaste en diferentes navegadores
- [ ] Los colores siguen la paleta de COLOR_SYSTEM.md

---

## 🐛 Solución de Problemas Comunes

### "Mis cambios desaparecieron"
→ En Figma Make se guarda automáticamente. Si usas Git, haz commit regularmente.

### "Alguien modificó lo mismo que yo"
→ Comunica con el equipo antes de editar archivos grandes.

### "El proyecto no funciona después de mis cambios"
→ Verifica errores en la consola. Deshaz cambios si es necesario.

### "No puedo ver los cambios de otros"
→ Refresca la página o pull los últimos cambios del repo.

---

## 💬 Comunicación del Equipo

### Antes de editar:
- ✅ "Voy a modificar el sistema de reservas"
- ✅ "Necesito cambiar los colores del mapa"
- ✅ "Agregaré 5 restaurantes nuevos"

### Al terminar:
- ✅ "Terminé la pantalla de pagos"
- ✅ "Arreglé el bug del QR"
- ✅ "Nuevos estilos en favoritos"

### Si hay problemas:
- ✅ "Encontré un bug en login, lo estoy revisando"
- ✅ "Necesito ayuda con los mapas"
- ✅ "Rompi algo sin querer, ¿me ayudan?"

---

## 📊 División de Tareas Sugerida

### Desarrollador Frontend 1:
- Pantallas de autenticación (Login/Registro)
- Perfil de usuario
- Menú de usuario

### Desarrollador Frontend 2:
- Mapa y búsqueda
- Lista de restaurantes
- Filtros

### Desarrollador Frontend 3:
- Detalles de restaurante
- Sistema de pre-orden
- Carrito

### Desarrollador Frontend 4:
- Sistema de reservas
- Generación de QR
- Historial

### Diseñador/UX:
- Paleta de colores
- Componentes visuales
- Logo y assets

---

## 🎯 Convenciones de Código

### Nombres de Componentes:
```tsx
// ✅ Bueno
export function MapScreen() {}
export function UserMenu() {}

// ❌ Malo
export function map() {}
export function usermenu() {}
```

### Nombres de Archivos:
```
✅ MapScreen.tsx
✅ UserMenu.tsx
❌ mapscreen.tsx
❌ user-menu.tsx
```

### Clases de Tailwind:
```tsx
// ✅ Bueno - usa los colores del sistema
className="bg-gradient-to-r from-orange-500 to-red-500"

// ❌ Malo - colores aleatorios
className="bg-blue-500"
```

### Comentarios:
```tsx
// ✅ Bueno
// Validar email antes de enviar
const isValidEmail = email.includes('@');

// ❌ Malo
// esto valida
const x = email.includes('@');
```

---

## 🏆 Mejores Prácticas

1. **Commits frecuentes** con mensajes claros
2. **Prueba antes de compartir**
3. **Documenta funciones complejas**
4. **Respeta el sistema de diseño** (colores, espaciado)
5. **No elimines código** sin consultar
6. **Usa componentes reutilizables**
7. **Mantén archivos pequeños** (< 300 líneas)

---

## 📞 ¿Necesitas Ayuda?

1. Lee esta guía completa
2. Revisa el código existente como ejemplo
3. Consulta README.md para contexto general
4. Pregunta al equipo en el canal de comunicación
5. Revisa la documentación de:
   - [React](https://react.dev)
   - [Tailwind CSS](https://tailwindcss.com)
   - [ShadCN UI](https://ui.shadcn.com)

---

## 🎉 ¡Listo para Colaborar!

Ahora todo tu equipo puede trabajar juntos en ReservaYa de forma organizada y eficiente.

**Recuerda:** La comunicación es clave. ¡Comparte lo que estás haciendo!
