# RespiraTEC

RespiraTEC es una plataforma web moderna y premium diseñada para centralizar, facilitar el acceso y gestionar eventos, talleres, descuentos y asociaciones estudiantiles en el entorno universitario.

## 🌟 La Causa
El sitio oficial actual de la universidad para la visualización de eventos, talleres y descuentos estudiantiles es poco visible, difícil de navegar y estéticamente anticuado. Esto genera que muchas actividades y oportunidades extracurriculares pasen desapercibidas para la comunidad estudiantil.

**RespiraTEC** nace para resolver esto, ofreciendo una interfaz moderna, limpia y de alto nivel que:
* Centraliza la oferta de eventos, talleres y descuentos universitarios.
* Facilita la postulación de estudiantes para unirse a asociaciones mediante flujos intuitivos.
* Ofrece paneles ágiles para administradores y representantes de asociaciones.

---

## 🛠️ Stack Tecnológico

El proyecto está estructurado como un monorepositorio con las siguientes tecnologías:

*   **Frontend**:
    *   [React](https://react.dev/) + [Vite](https://vite.dev/) (para un entorno de desarrollo ultrarrápido).
    *   [Tailwind CSS](https://tailwindcss.com/) (para el sistema de diseño estético, moderno y responsivo).
    *   [React Router DOM](https://reactrouter.com/) (para la navegación de rutas públicas y protegidas).
    *   Context API (para la gestión del estado global de autenticación).
*   **Backend**:
    *   [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (para construir la API REST).
    *   [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) (para el almacenamiento y modelado de datos de forma flexible).
    *   [JSON Web Tokens (JWT)](https://jwt.io/) (para el control de sesiones y autenticación segura).
    *   [BcryptJS](https://github.com/dcodeIO/bcrypt.js/) (para el encriptado y hashing de contraseñas).
    *   [Cloudinary](https://cloudinary.com/) (para el almacenamiento de imágenes y fotos de perfil de miembros).

---

## 🚀 Comandos para Ejecutar

Siga estos pasos para levantar el entorno de desarrollo local:

### 1. Requisitos Previos
Asegúrese de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en su equipo.

### 2. Configurar Variables de Entorno
Cree archivos `.env` locales en las carpetas respectivas con la siguiente estructura básica:

*   **En `backend/.env`**:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/respiratec
    JWT_SECRET=secreto_super_seguro
    JWT_EXPIRE=24h
    # Opcionales para almacenamiento de imágenes
    CLOUDINARY_CLOUD_NAME=nombre_cloudinary
    CLOUDINARY_API_KEY=api_key_cloudinary
    CLOUDINARY_API_SECRET=api_secret_cloudinary
    ```
*   **En `frontend/.env`**:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

### 3. Levantar el Backend
Abra una terminal y ubíquese en la carpeta `backend`:
```bash
cd backend
npm install
npm run dev
```
El servidor backend se ejecutará en: `http://localhost:5000`

### 4. Levantar el Frontend
Abra otra terminal diferente y ubíquese en la carpeta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
El servidor de desarrollo del frontend se levantará en: `http://localhost:5173` (o la dirección indicada por Vite).

---

## 📋 Lista de Tareas (TODO List)

### ✅ Completado (Done)
- [x] **Configuración Base**: Inicialización del monorepositorio, base de datos MongoDB y servidor de Express.
- [x] **Autenticación Completa**: Registro, Login, Contexto de sesión en React y protección de rutas según rol (Estudiante, Representante, Administrador).
- [x] **Panel de Administración**: Gestión administrativa de eventos, asociaciones y miembros.
- [x] **Vista Detallada de Asociaciones**: Visualización limpia de información institucional, logo y sobre nosotros (sin formularios bloqueados).
- [x] **Flujo de Membresía**: Envío de solicitudes con modal de confirmación y botón de cancelación interactivo si está pendiente.
- [x] **Lista de Miembros**: Visualización dinámica de los integrantes de la asociación con foto de perfil (solo para usuarios aceptados).
- [x] **Control de Re-postulaciones (Cooldown de 24h)**: Restricción en base de datos para que las cuentas rechazadas no puedan re-enviar solicitud inmediatamente, habilitando el botón dinámico de "Volver a solicitar" una vez transcurrido el tiempo.
- [x] **Ajustes de Interfaz**: Diseño premium y adaptable para los toasts de Login y Registro (inline en móviles y flotante de ancho mediano/grande en desktop).

### ⏳ Pendiente (To Do)
- [ ] **Generador de Certificados (Opcional)**: Emisión y descarga en PDF de diplomas de participación para los talleres completados (Si alguien está inscrito en un taller y ya terminó, se habilita para que pueda descargar un comprobante cuando quiera).
- [ ] **Buscador de Eventos, Talleres y Descuentos**: Filtros avanzados de búsqueda por fecha, categoría y ubicación.
- [ ] **Sección de Feedback**: Calificaciones y comentarios de estudiantes acerca de los talleres y eventos FINALIZADOS.
- [ ] **Integración de Pasarela de Pago (Mock/Simulada)**:

La Interfaz (UI): Diseñamos un modal o pantalla de pago hermosa.
Le ponemos las opciones "Tarjeta de Crédito/Débito" y "SINPE Móvil".

Si elige Tarjeta: Le mostramos un formulario que pida los 16 dígitos, fecha y CVV. Le ponemos una validación súper básica (que no esté vacío y que tenga números). Al darle "Pagar", ponemos un spinner de carga por 2 segundos (para dar la ilusión de que va al banco) y ¡pum! Pantalla de éxito.

Si elige SINPE: Mostramos un código QR de mentiras y un número. Ponemos un botón que diga "Ya realicé el pago". Hace el mismo spinner de 2 segundos y lo aprueba automáticamente.
