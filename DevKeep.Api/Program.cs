using DevKeep.Api.Data;
using DevKeep.Api.Middleware;
using DevKeep.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & API Explorer / Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DevKeep API",
        Version = "v1",
        Description = "API backend para notas de cursos técnicos, seguimiento de progreso y cheatsheets de desarrollador."
    });
});

// Services DI Registration
builder.Services.AddScoped<IMarkdownExportService, MarkdownExportService>();
builder.Services.AddScoped<ICourseService, CourseService>();

// Global Exception Handler (.NET 8 Native)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Database Connection & Switching Logic (SQLite local vs Npgsql PostgreSQL / Supabase)
var connectionString = Environment.GetEnvironmentVariable("SUPABASE_CONNECTION_STRING")
                       ?? builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? "Data Source=devkeep.db";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
        connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
        connectionString.Contains("supabase", StringComparison.OrdinalIgnoreCase) ||
        connectionString.Contains("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseSqlite(connectionString);
    }
});

// Health Checks (DB & Service Monitoring for PaaS / Render)
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database_health_check");

// Configure CORS for Local Development & Vercel deployments
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevKeepCorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;
            var host = new Uri(origin).Host;
            return host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                   host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
                   host.Equals("vercel.app", StringComparison.OrdinalIgnoreCase);
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Enable Global Exception Handler Middleware
app.UseExceptionHandler();

// Enable Swagger UI across all environments for initial testing and deployment
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DevKeep API v1");
    c.RoutePrefix = string.Empty; // Swagger available at root "/"
});

app.UseCors("DevKeepCorsPolicy");

app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Health Check Endpoint for Render / Uptime Monitors
app.MapHealthChecks("/health");

// Automatic DB Initialization & Idempotent Schema Synchronization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        var databaseCreator = (RelationalDatabaseCreator)dbContext.Database.GetService<IDatabaseCreator>();
        
        if (!databaseCreator.HasTables())
        {
            databaseCreator.CreateTables();
            logger.LogInformation("Database tables created successfully.");
        }
        else
        {
            // Idempotent column sync for new Course fields (TotalChapters, CurrentChapter, CertificateUrl)
            if (dbContext.Database.IsNpgsql())
            {
                dbContext.Database.ExecuteSqlRaw(@"
                    ALTER TABLE ""Courses"" ADD COLUMN IF NOT EXISTS ""TotalChapters"" integer NOT NULL DEFAULT 0;
                    ALTER TABLE ""Courses"" ADD COLUMN IF NOT EXISTS ""CurrentChapter"" integer NOT NULL DEFAULT 0;
                    ALTER TABLE ""Courses"" ADD COLUMN IF NOT EXISTS ""CertificateUrl"" text NULL;
                ");
                logger.LogInformation("PostgreSQL Supabase schema synchronized with new fields.");
            }
            else if (dbContext.Database.IsSqlite())
            {
                try { dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Courses"" ADD COLUMN ""TotalChapters"" INTEGER NOT NULL DEFAULT 0;"); } catch {}
                try { dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Courses"" ADD COLUMN ""CurrentChapter"" INTEGER NOT NULL DEFAULT 0;"); } catch {}
                try { dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""Courses"" ADD COLUMN ""CertificateUrl"" TEXT NULL;"); } catch {}
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogWarning("Database schema sync notification: {Message}", ex.Message);
    }
}

app.Run();
