# 📤 Guía de Exportación - ReservaYa

Esta guía te ayudará a exportar y compartir el proyecto ReservaYa con otros colaboradores.

## 🎯 Métodos de Exportación

### Método 1: Compartir Link de Figma Make (Recomendado)

1. **Busca el botón "Share"** en la esquina superior derecha de Figma Make
2. **Copia el link** del proyecto
3. **Comparte el link** con tus colaboradores
4. Los colaboradores pueden:
   - Ver el proyecto
   - Hacer fork/remix para editar
   - Duplicar el proyecto

---

### Método 2: Exportar como ZIP

1. **Haz clic en el menú** (⋮ o ☰) en la barra superior
2. **Busca "Export"** o "Download"
3. **Selecciona "Download as ZIP"**
4. El archivo contendrá:
   - Todos los archivos `.tsx`
   - Estilos `globals.css`
   - Documentación `.md`
   - Estructura de carpetas completa

#### Contenido del ZIP:
```
reservaya.zip
├── App.tsx
├── components/
│   ├── LoginScreen.tsx
│   ├── MapScreen.tsx
│   ├── RestaurantDetails.tsx
│   ├── QRConfirmation.tsx
│   ├── ReservationsScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── UserMenu.tsx
│   ├── RegisterScreen.tsx
│   └── Logo.tsx
├── styles/
│   └── globals.css
├── README.md
├── COLOR_SYSTEM.md
└── EXPORT_GUIDE.md
```

---

### Método 3: Exportar a CodeSandbox

1. **Busca el botón "Export"** o icono de compartir
2. **Selecciona "Open in CodeSandbox"**
3. Se abrirá una nueva pestaña con el proyecto en CodeSandbox
4. **Comparte el URL** de CodeSandbox con tu equipo
5. Los colaboradores pueden:
   - Editar en tiempo real
   - Hacer fork del sandbox
   - Ver cambios en vivo

**Ventajas:**
- ✅ Edición colaborativa en tiempo real
- ✅ Preview instantáneo
- ✅ Versionamiento automático
- ✅ Sin necesidad de instalación local

---

### Método 4: Exportar a GitHub

1. **Descarga el proyecto como ZIP** (Método 2)
2. **Crea un nuevo repositorio** en GitHub:
   ```bash
   # Ir a github.com y crear nuevo repositorio
   # Nombre: reservaya
   # Descripción: Aplicación de reservas de restaurantes
   ```

3. **Sube los archivos**:
   ```bash
   # Descomprime el ZIP
   unzip reservaya.zip
   cd reservaya

   # Inicializa git
   git init
   git add .
   git commit -m "Initial commit - ReservaYa app"

   # Conecta con GitHub
   git remote add origin https://github.com/tu-usuario/reservaya.git
   git push -u origin main
   ```

4. **Configura colaboradores**:
   - Ve a Settings → Collaborators
   - Invita a los usuarios por email o username
   - Selecciona permisos (Write para editar)

---

### Método 5: Copiar Código Manualmente

Si prefieres copiar archivos específicos:

#### Archivos Principales a Compartir:

**1. Componente Principal:**
- `/App.tsx` - Lógica principal y navegación

**2. Pantallas:**
- `/components/LoginScreen.tsx`
- `/components/RegisterScreen.tsx`
- `/components/MapScreen.tsx`
- `/components/RestaurantDetails.tsx`
- `/components/QRConfirmation.tsx`
- `/components/ReservationsScreen.tsx`
- `/components/FavoritesScreen.tsx`
- `/components/UserMenu.tsx`

**3. Componentes Reutilizables:**
- `/components/Logo.tsx`

**4. Estilos:**
- `/styles/globals.css`

**5. Documentación:**
- `/README.md`
- `/COLOR_SYSTEM.md`
- `/EXPORT_GUIDE.md` (este archivo)

**6. Componentes UI (ShadCN):**
- Toda la carpeta `/components/ui/`

---

## 🔑 Dar Permisos de Editor

### En Figma Make:
1. **Abre el proyecto** en Figma Make
2. **Haz clic en "Share"** (botón superior derecho)
3. **Cambia el acceso** de "View only" a "Can edit"
4. **Copia el link** y compártelo
5. Todos con el link podrán editar

### En GitHub:
1. **Repository Settings** → **Manage Access**
2. **Invite a collaborator**
3. Ingresa el email o username
4. Selecciona rol: **Write** (para editar)

### En CodeSandbox:
1. **Haz clic en "Share"** en CodeSandbox
2. **Editor Link** - Crea un link de editor
3. Cualquiera con el link puede editar
4. O invita usuarios específicos por email

---

## 📋 Checklist para Compartir

Antes de compartir, asegúrate de:

- [ ] **README.md** está actualizado con instrucciones
- [ ] **COLOR_SYSTEM.md** documenta la paleta de colores
- [ ] Todos los **componentes** tienen comentarios claros
- [ ] Los **datos de prueba** están documentados
- [ ] Las **dependencias** están listadas
- [ ] Hay **instrucciones de instalación**
- [ ] Los **archivos sensibles** están protegidos (si aplica)

---

## 🛠️ Instrucciones para Colaboradores

### Para empezar a editar:

**Opción A - Desde Figma Make:**
1. Abre el link compartido
2. Haz clic en "Remix" o "Fork"
3. Comienza a editar tu copia
4. Comparte tus cambios

**Opción B - Desde ZIP:**
1. Descarga el archivo ZIP
2. Descomprime en tu computadora
3. Abre la carpeta en tu editor de código
4. Instala dependencias: `npm install`
5. Inicia el servidor: `npm run dev`

**Opción C - Desde GitHub:**
1. Clona el repositorio:
   ```bash
   git clone https://github.com/usuario/reservaya.git
   cd reservaya
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea una rama para tus cambios:
   ```bash
   git checkout -b feature/mi-funcionalidad
   ```
4. Haz tus cambios y commit:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin feature/mi-funcionalidad
   ```
5. Crea un Pull Request en GitHub

---

## 🌐 Opciones de Hosting

Si quieres compartir la app funcionando:

### Vercel (Recomendado):
1. Conecta tu repositorio de GitHub
2. Vercel detecta automáticamente React
3. Deploy automático en cada commit
4. URL pública: `reservaya.vercel.app`

### Netlify:
1. Arrastra la carpeta del proyecto
2. Deploy instantáneo
3. URL pública: `reservaya.netlify.app`

### GitHub Pages:
1. Construye el proyecto: `npm run build`
2. Sube la carpeta `dist/` a gh-pages branch
3. Activa GitHub Pages en Settings

---

## 💡 Mejores Prácticas

### Al colaborar:
1. **Comunica cambios importantes** antes de hacerlos
2. **Usa ramas** para nuevas funcionalidades
3. **Documenta** código nuevo
4. **Prueba** antes de compartir cambios
5. **Mantén el estilo** de código consistente

### Al compartir:
1. **Explica el contexto** del proyecto
2. **Proporciona credenciales** de prueba
3. **Documenta funcionalidades** nuevas
4. **Incluye screenshots** si es posible
5. **Menciona limitaciones** conocidas

---

## 🆘 Solución de Problemas

### "No puedo editar el proyecto"
→ Verifica que el link tenga permisos de edición

### "Faltan dependencias"
→ Ejecuta `npm install` después de descargar

### "El código no funciona localmente"
→ Asegúrate de tener Node.js 18+ instalado

### "Los estilos se ven diferentes"
→ Verifica que `globals.css` esté importado en App.tsx

---

## 📞 Contacto y Soporte

Si tienes problemas para exportar o compartir:

1. Revisa esta guía completa
2. Consulta el README.md del proyecto
3. Verifica la documentación de Figma Make
4. Contacta al administrador del proyecto

---

**¡Listo para colaborar! 🚀**

Ahora tu equipo puede trabajar juntos en ReservaYa.
