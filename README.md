# 🐾 Conexión Animal

**Plataforma SaaS para la Gestión Digital de Protectoras y Colonias Felinas**

> Proyecto Final de Ciclo — Grado Superior DAW · IES Virgen de la Paloma · 2024–2026

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Deploy Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![Database](https://img.shields.io/badge/DB-PostgreSQL%2015-blue?logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Descripción

**Conexión Animal** es una aplicación web full-stack SaaS que digitaliza la gestión de protectoras de animales y colonias felinas urbanas, sustituyendo los procesos manuales dispersos (hojas de cálculo, WhatsApp, redes sociales) por una plataforma centralizada, moderna y escalable.

### Características principales

- 🐶 **Portal público de adopciones** con galería filtrable por especie, edad, ubicación y características
- 🔐 **Control de acceso por roles** (superadmin, admin, gestor, user) con middleware JWT
- 🚨 **Alertas urgentes automáticas** por email masivo vía Gmail API oficial (OAuth 2.0)
- 📋 **Tablón de ayuda moderado** con ReCAPTCHA v3, rate limiting y flujo de aprobación
- 🐱 **Gestión de colonias felinas** con geolocalización y registro de incidencias
- 💳 **Modelo Freemium** con control de límites por plan (Free / Pro 9.99€/mes) via Stripe
- 📊 **Dashboard con KPIs**: tasa de adopción, eficiencia de alertas, ratio de moderación

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, Context API, React Hooks |
| **Backend** | Node.js 20, Express.js (MVC) |
| **Base de datos** | PostgreSQL 15 (Neon.tech) |
| **Autenticación** | JWT + bcrypt |
| **Email** | Gmail API oficial (OAuth 2.0) |
| **Imágenes** | Cloudinary API |
| **Pagos** | Stripe Checkout + Webhooks |
| **Seguridad** | ReCAPTCHA v3, Helmet.js, express-rate-limit |
| **Deploy FE** | Vercel (CI/CD automático) |
| **Deploy BE** | Render (PaaS) |
| **Dev local** | Docker Desktop + DBeaver |
| **Calidad** | ESLint, Prettier, GitFlow |

---

## 🚀 Instalación y Despliegue Local

### Requisitos previos

- Node.js v20 LTS o superior
- npm v9 o superior
- Docker Desktop (para la base de datos local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/conexion-animal.git
cd conexion-animal
```

### 2. Configurar el Backend

```bash
cd backend
npm install
cp .env.example .env   # Rellenar las variables (ver sección Variables de Entorno)
docker-compose up -d   # Levantar PostgreSQL en Docker
npm run migrate        # Ejecutar migraciones
npm run seed           # Poblar con datos de prueba
npm run dev            # Iniciar servidor en modo desarrollo
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Añadir REACT_APP_API_URL=http://localhost:3001
npm start              # Iniciar la SPA en http://localhost:3000
```

---

## ⚙️ Variables de Entorno (Backend)

Crea un archivo `.env` en `/backend` con las siguientes variables:

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/conexion_animal

# Servidor
PORT=3001
NODE_ENV=development

# Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura

# Gmail API (OAuth 2.0)
EMAIL_USER=conexionanimal@gmail.com
GMAIL_CLIENT_ID=78xxxx-xxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GMAIL_REFRESH_TOKEN=1//0xxxxxxxxxxxxxxxxxxxx

# Servicios externos
CLOUDINARY_URL=cloudinary://api_key:secret@cloud_name
RECAPTCHA_SECRET_KEY=6LeXXXXXXXXXXXXXXXXXXXXX

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🏗️ Arquitectura

La aplicación sigue un patrón **REST API + SPA totalmente desacoplados**:
┌─────────────┐ HTTP/REST ┌──────────────────┐ SQL ┌──────────────┐
│ React SPA │ ◄────────────────► │ Node.js/Express │ ◄──────────► │ PostgreSQL │
│ (Vercel) │ │ (Render) │ │ (Neon.tech) │
└─────────────┘ └──────────────────┘ └──────────────┘
│
┌────────────────┼────────────────┐
▼ ▼ ▼
Gmail API Cloudinary Stripe API

### Estructura del proyecto
conexion-animal/
├── backend/
│ ├── controllers/ # Lógica de negocio por módulo
│ ├── routes/ # Definición de endpoints
│ ├── middleware/ # JWT, roles, rate limiting, freemium
│ ├── models/ # Queries SQL
│ └── config/ # DB y servicios externos
└── frontend/
├── components/
│ ├── ui/ # Componentes genéricos reutilizables
│ └── business/ # Componentes con lógica de negocio
├── pages/ # Vistas por ruta
├── context/ # AuthContext (estado global)
└── hooks/ # Custom hooks

text

---

## 👥 Roles y Permisos

| Rol | Capacidades |
|---|---|
| **superadmin** | Gestión total: usuarios, roles, moderación del tablón |
| **admin** | CRUD animales, gestión de adopciones, alertas urgentes |
| **gestor** | Gestión de colonias, publicaciones urgentes (verificado) |
| **user** | Portal público, solicitudes de adopción, tablón |

---

## 💰 Modelo Freemium

| Característica | Plan Gratuito | Plan Pro (9.99€/mes) |
|---|---|---|
| Administradores | Hasta 3 | Ilimitados |
| Fichas de animales | Hasta 50 | Ilimitadas |
| Posts en tablón | 5 por mes | Ilimitados |
| Emails de alerta | 100 por mes | Ilimitados |
| KPIs avanzados | ❌ | ✅ |
| Soporte | Comunidad | Prioritario |

---

## 🔌 Principales Endpoints de la API
POST /api/auth/register → Registro de usuario
POST /api/auth/login → Login + token JWT

GET /api/animales → Lista animales activos (público)
POST /api/animales → Crear animal (admin)
PUT /api/animales/:id → Actualizar animal (admin)
DELETE /api/animales/:id → Soft delete (admin)

POST /api/necesidades → Crear alerta (urgente → dispara Gmail API)
GET /api/necesidades → Listar necesidades activas

POST /api/posts → Crear post (estado: pending)
GET /api/posts → Listar posts aprobados (público)
PATCH /api/posts/admin/moderate/:id → Aprobar/rechazar post (superadmin)

text

---

## 🧪 Pruebas

El proyecto incluye un plan de pruebas con casos documentados en Postman que cubren:

- ✅ Autenticación y autorización JWT
- ✅ Límites del plan freemium (HTTP 403 al superar cuota)
- ✅ Flujo completo de solicitud de adopción (E2E)
- ✅ Moderación del tablón (pending → approved → inmutable)
- ✅ Rate limiting (HTTP 429 tras 11 intentos en 15 min)
- ✅ ReCAPTCHA (HTTP 400 con score < 0.5)
- ✅ Validación de roles insuficientes (HTTP 403)

---

## 🔮 Mejoras Futuras

- [ ] App móvil con **React Native** (modo offline para gestores de campo)
- [ ] **WhatsApp Business API** para notificaciones de emergencia
- [ ] **IA de matching** adoptante–animal con ML
- [ ] Migración de imágenes a **AWS S3**
- [ ] **Internacionalización (i18n)** para expansión hispanohablante
- [ ] Panel de **KPIs avanzados** con métricas de impacto

---

## 👨‍💻 Autor

**Manuel Zarate** — [@tu-usuario-github](https://github.com/manue2011)

Proyecto Final de Ciclo · DAW · IES Virgen de la Paloma · Madrid · 2026
