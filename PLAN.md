# DevKeep - Plan de Arquitectura e Implementación Backend

DevKeep es una plataforma backend centralizada para el registro de notas técnicas de cursos (Udemy, YouTube, Platzi, Docs, Libros), seguimiento de progreso y hojas de atajos (cheatsheets de comandos/atajos para desarrolladores como Podman, Docker, .NET, Linux, Git).

---

## 1. Stack Tecnológico

- **Framework**: .NET 8 Web API (C#)
- **ORM**: Entity Framework Core 8.0
- **Base de Datos**: 
  - **Desarrollo local**: SQLite (`devkeep.db`)
  - **Producción**: PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`)
- **Documentación API**: Swagger UI / OpenAPI (`Swashbuckle.AspNetCore`)
- **Contenedorización**: Dockerfile / Containerfile multi-stage (compatible con Podman y Render, expuesto en puerto `8080`)

---

## 2. Estructura del Proyecto

```text
StudyDeck/
├── DevKeep.sln
├── Dockerfile
├── Containerfile
├── PLAN.md
└── DevKeep.Api/
    ├── Program.cs
    ├── DevKeep.Api.csproj
    ├── appsettings.json
    ├── appsettings.Development.json
    ├── Data/
    │   └── AppDbContext.cs
    ├── Models/
    │   ├── Course.cs
    │   ├── CourseNote.cs
    │   └── CheatSheetItem.cs
    ├── DTOs/
    │   ├── CourseDtos.cs
    │   ├── NoteDtos.cs
    │   ├── CheatSheetDtos.cs
    │   └── SearchDtos.cs
    ├── Services/
    │   ├── MarkdownExportService.cs
    │   └── SearchService.cs
    └── Controllers/
        ├── CoursesController.cs
        ├── NotesController.cs
        ├── CheatSheetsController.cs
        └── SearchController.cs
```

---

## 3. Modelos de Dominio y Entidades EF Core

### 3.1 `Course`
- `Id` (Guid, PK)
- `Title` (string, requerido)
- `Platform` (string, ej: "Udemy", "YouTube", "Platzi", "Doc", "Libro")
- `Instructor` (string?)
- `CourseUrl` (string?)
- `TotalLessons` (int)
- `CompletedLessons` (int)
- `Status` (string, ej: "In Progress", "Completed", "Paused")
- `CreatedAt` (DateTime)
- `Notes` (List<CourseNote>, Relación 1-N)
- `ProgressPercentage` (Propiedad calculada `decimal`)

### 3.2 `CourseNote`
- `Id` (Guid, PK)
- `CourseId` (Guid, FK -> Course.Id)
- `Course` (Navegación)
- `SectionTitle` (string?, Módulo/Capítulo)
- `LessonTitle` (string, requerido)
- `VideoTimestamp` (string?, ej: "12:45")
- `DirectUrl` (string?, Enlace exacto)
- `MarkdownContent` (string, Contenido en Markdown)
- `Tags` (string, Separados por coma)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime?)

### 3.3 `CheatSheetItem`
- `Id` (Guid, PK)
- `Technology` (string, ej: "Podman", "Docker", "Git", ".NET", "Linux")
- `Category` (string, ej: "Contenedores", "Redes", "Volúmenes", "Build")
- `Command` (string, requerido)
- `Description` (string)
- `IsFavorite` (bool)
- `CreatedAt` (DateTime)

---

## 4. Endpoints de la API REST

### Courses (`/api/courses`)
- `GET /api/courses` - Lista todos los cursos.
- `GET /api/courses/{id}` - Obtiene detalle de un curso con sus notas.
- `POST /api/courses` - Crea un curso.
- `PUT /api/courses/{id}` - Actualiza un curso.
- `DELETE /api/courses/{id}` - Elimina un curso (borrado en cascada de sus notas).
- `GET /api/courses/{id}/export-markdown` - Exporta todas las notas del curso concatenadas en archivo Markdown (`.md`).

### Notes (`/api/notes`)
- `GET /api/notes?courseId={id}&tag={tag}` - Lista notas filtradas por curso o etiqueta.
- `GET /api/notes/{id}` - Obtiene nota por ID.
- `POST /api/notes` - Crea una nota para un curso.
- `PUT /api/notes/{id}` - Actualiza una nota.
- `DELETE /api/notes/{id}` - Elimina una nota.

### CheatSheets (`/api/cheatsheets`)
- `GET /api/cheatsheets?technology={tech}&category={cat}&isFavorite={fav}` - Lista atajos filtrados.
- `GET /api/cheatsheets/{id}` - Obtiene atajo por ID.
- `POST /api/cheatsheets` - Crea un atajo.
- `PUT /api/cheatsheets/{id}` - Actualiza un atajo.
- `DELETE /api/cheatsheets/{id}` - Elimina un atajo.

### Search (`/api/search`)
- `GET /api/search?q={term}` - Búsqueda global en títulos de cursos, contenido Markdown de notas y comandos/descripciones de cheatsheets.

---

## 5. Configuración y Despliegue

### 5.1 CORS
- Permite orígenes locales (`http://localhost:5173`) y subdominios de Vercel (`https://*.vercel.app`).

### 5.2 Base de Datos Dual (SQLite / PostgreSQL)
- Detección automática en `Program.cs`: si la cadena de conexión o variable de entorno contiene `Host=` o `Server=`, usa PostgreSQL (`Npgsql`); de lo contrario, usa SQLite (`devkeep.db`).

### 5.3 Dockerfile / Containerfile
- Multi-stage build utilizando SDK .NET 8 para compilación y ASP.NET 8.0 Runtime para ejecución.
- Puerto expuesto: `8080` (configurado mediante `ASPNETCORE_URLS=http://+:8080`).
