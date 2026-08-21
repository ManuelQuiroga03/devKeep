using DevKeep.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevKeep.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseNote> CourseNotes => Set<CourseNote>();
    public DbSet<CheatSheetItem> CheatSheetItems => Set<CheatSheetItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Course - CourseNote 1-to-N relationship with cascade delete
        modelBuilder.Entity<CourseNote>()
            .HasOne(n => n.Course)
            .WithMany(c => c.Notes)
            .HasForeignKey(n => n.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Data Seeding for CheatSheetItems
        modelBuilder.Entity<CheatSheetItem>().HasData(
            new CheatSheetItem
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Technology = "Podman",
                Category = "Contenedores",
                Command = "podman run -d --name app -p 8080:8080 my-image",
                Description = "Ejecutar un contenedor en segundo plano redirigiendo el puerto 8080.",
                IsFavorite = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CheatSheetItem
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Technology = "Podman",
                Category = "Volúmenes",
                Command = "podman volume create my_data",
                Description = "Crear un volumen de datos persistente para contenedores Podman.",
                IsFavorite = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CheatSheetItem
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Technology = "Docker",
                Category = "Build",
                Command = "docker build -t my-app:latest -f Containerfile .",
                Description = "Construir una imagen OCI utilizando una Containerfile o Dockerfile.",
                IsFavorite = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CheatSheetItem
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Technology = "Git",
                Category = "Ramas",
                Command = "git checkout -b feature/nueva-funcionalidad",
                Description = "Crear y cambiar a una nueva rama de desarrollo local.",
                IsFavorite = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CheatSheetItem
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Technology = ".NET",
                Category = "CLI",
                Command = "dotnet watch run",
                Description = "Ejecutar la API con hot reload habilitado para desarrollo.",
                IsFavorite = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new CheatSheetItem
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                Technology = "Linux",
                Category = "Redes",
                Command = "netstat -tuln | grep 8080",
                Description = "Verificar qué proceso o servicio escucha en el puerto 8080.",
                IsFavorite = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
