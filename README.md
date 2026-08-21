# DevKeep - Technical Learning & Cheatsheet Platform

**DevKeep** es una plataforma web full-stack diseñada específicamente para desarrolladores. Permite gestionar de manera estructurada el aprendizaje técnico (cursos de Udemy, YouTube, Platzi, Documentación, Libros), llevar el seguimiento por capítulos y lecciones, adjuntar certificados de finalización, tomar notas enriquecidas en Markdown y acceder a una biblioteca de hojas de atajos (*cheatsheets*) de comandos CLI (Podman, Docker, Git, .NET, Linux) con copia en 1-clic y búsqueda global por teclado (`Ctrl + K`).

---

## 🚀 Características Principales

- **Gestión y Seguimiento de Cursos**:
  - Clasificación por plataforma (Udemy, YouTube, Platzi, Doc, Libro).
  - Estados de avance: *Por empezar* (`Not Started`), *En progreso* (`In Progress`), *Completado* (`Completed`).
  - Progreso dinámico calculado (%) por número de lecciones o capítulos completados (`Cap. X/Y`).
  - Adjunto y visualización de certificados de finalización (archivos PDF, PNG, JPG, WEBP o enlaces públicos) con visor directo.
- **Sala de Estudio y Visor Markdown**:
  - Visor y editor de notas de lecciones en Markdown enriquecido con resaltado de sintaxis de código.
  - Marcas de tiempo de video, enlaces directos a clases y etiquetas (*tags*).
  - Exportación de todas las notas de un curso concatenadas en un archivo `.md` estructurado.
- **Biblioteca de Cheatsheets / Atajos CLI**:
  - Colección de comandos esenciales organizados por tecnología (**Podman**, **Docker**, **Git**, **.NET**, **Linux**).
  - Botón **1-Click Copy** para copiar comandos inmediatamente al portapapeles.
  - Marcar y filtrar atajos destacados en la sección de **Favoritos**.
- **Command Palette (`Ctrl + K` / `Cmd + K`)**:
  - Modal de búsqueda global por teclado que realiza consultas en tiempo real a la API sobre títulos de cursos, notas Markdown y comandos CLI.
- **Interfaz Técnica Dark Mode**:
  - Diseño minimalista sin emojis, utilizando la iconografía vectorial de `lucide-react` y notificaciones modernas en tema oscuro (`sonner`).

---

## 🛠 Stack Tecnológico

### Backend
- **Framework**: .NET 8 Web API (C#)
- **ORM**: Entity Framework Core 8
- **Base de Datos**: PostgreSQL (Supabase en Nube) con *fallback* automático a SQLite (`devkeep.db`) en desarrollo local.
- **Resiliencia & Observabilidad**: 
  - Manejador global de excepciones nativo de .NET 8 con respuestas bajo el estándar **RFC 7807 (ProblemDetails)**.
  - Monitorización del estado del servicio y conexión a BD mediante `/health`.
  - Documentación interactiva de API con **Swagger UI / OpenAPI**.

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS v4 + `@tailwindcss/typography` + `@tailwindcss/postcss`
- **Iconografía & UI**: `lucide-react`, `sonner` (Toast Alerts)
- **Navegación & HTTP**: `react-router-dom` v6, `axios`
- **Markdown**: `react-markdown`, `remark-gfm`

### DevOps & Contenedorización
- Multi-stage **`Dockerfile`** y **`Containerfile`** optimizados en .NET 8 ASP.NET Runtime (compatible con **Podman**, **Docker** y despliegue en **Render** / **Vercel**).

---

## 📁 Estructura del Proyecto

```text
StudyDeck/
├── DevKeep.sln
├── Dockerfile
├── Containerfile
├── PLAN.md
├── README.md
├── DevKeep.Api/                 # Backend .NET 8 Web API
│   ├── Program.cs
│   ├── Controllers/             # Courses, Notes, CheatSheets, Search
│   ├── Data/                    # AppDbContext & Data Seeding
│   ├── DTOs/                    # Data Transfer Objects & Validations
│   ├── Middleware/              # GlobalExceptionHandler (RFC 7807)
│   ├── Models/                  # Course, CourseNote, CheatSheetItem
│   └── Services/                # MarkdownExportService
└── client/                      # Frontend React + Vite + TypeScript
    ├── src/
    │   ├── components/          # CodeBlock, Modal, CommandPaletteModal
    │   ├── layout/              # Sidebar, Topbar, MainLayout
    │   ├── pages/               # Dashboard, Courses, CourseDetail, Cheatsheets, Favorites
    │   ├── services/            # Axios API Services
    │   └── types/               # TypeScript Interfaces
    ├── vercel.json
    └── tailwind.config.js
```

---

## ⚙️ Configuración e Instalación Local

### Requisitos Previos
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/ManuelQuiroga03/devKeep.git
cd devKeep
```

### 2. Iniciar el Backend (.NET 8)
```bash
cd DevKeep.Api
dotnet run
```
- La API iniciará en `http://localhost:5270`.
- Documentación Swagger disponible en `http://localhost:5270/index.html`.
- Endpoint de salud disponible en `http://localhost:5270/health`.

### 3. Iniciar el Frontend (React + Vite)
En otra ventana de terminal:
```bash
cd client
npm install
npm run dev
```
- El frontend estará disponible en `http://localhost:5173`.

---

## 🐳 Ejecución con Contenedores (Podman / Docker)

Para construir y ejecutar la imagen OCI en el puerto `8080`:

```bash
# Construir la imagen
podman build -t devkeep-backend -f Containerfile .
# o con Docker:
docker build -t devkeep-backend -f Dockerfile .

# Ejecutar el contenedor
podman run -d -p 8080:8080 --name devkeep-api devkeep-backend
```

---

## 📄 Licencia

Este proyecto fue desarrollado bajo la licencia MIT.
