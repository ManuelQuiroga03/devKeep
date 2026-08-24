using System.Text;
using DevKeep.Api.Data;
using DevKeep.Api.DTOs;
using DevKeep.Api.Models;
using DevKeep.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevKeep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMarkdownExportService _exportService;
    private readonly IWebHostEnvironment _environment;

    public CoursesController(AppDbContext context, IMarkdownExportService exportService, IWebHostEnvironment environment)
    {
        _context = context;
        _exportService = exportService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
    {
        return await _context.Courses
            .Include(c => c.Notes)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Course>> GetCourse(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Notes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = $"Curso con ID {id} no encontrado." });

        return course;
    }

    [HttpPost]
    public async Task<ActionResult<Course>> CreateCourse(CreateCourseDto dto)
    {
        var course = new Course
        {
            Title = dto.Title.Trim(),
            Platform = dto.Platform.Trim(),
            Instructor = string.IsNullOrWhiteSpace(dto.Instructor) ? null : dto.Instructor.Trim(),
            CourseUrl = string.IsNullOrWhiteSpace(dto.CourseUrl) ? null : dto.CourseUrl.Trim(),
            TotalChapters = dto.TotalChapters,
            CurrentChapter = dto.CurrentChapter,
            TotalLessons = dto.TotalLessons,
            CompletedLessons = dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) && dto.TotalLessons > 0 
                ? dto.TotalLessons 
                : dto.CompletedLessons,
            Status = dto.Status,
            CertificateUrl = string.IsNullOrWhiteSpace(dto.CertificateUrl) ? null : dto.CertificateUrl.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCourse(Guid id, UpdateCourseDto dto)
    {
        if (dto.CompletedLessons > dto.TotalLessons && dto.TotalLessons > 0)
        {
            return BadRequest(new { message = "Las lecciones completadas (CompletedLessons) no pueden superar el total de lecciones (TotalLessons) del curso." });
        }

        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = $"Curso con ID {id} no encontrado." });

        course.Title = dto.Title.Trim();
        course.Platform = dto.Platform.Trim();
        course.Instructor = string.IsNullOrWhiteSpace(dto.Instructor) ? null : dto.Instructor.Trim();
        course.CourseUrl = string.IsNullOrWhiteSpace(dto.CourseUrl) ? null : dto.CourseUrl.Trim();
        course.TotalChapters = dto.TotalChapters;
        course.CurrentChapter = dto.CurrentChapter;
        course.TotalLessons = dto.TotalLessons;
        course.CompletedLessons = dto.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) && dto.TotalLessons > 0 
            ? dto.TotalLessons 
            : dto.CompletedLessons;
        course.Status = dto.Status;
        course.CertificateUrl = string.IsNullOrWhiteSpace(dto.CertificateUrl) ? course.CertificateUrl : dto.CertificateUrl.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = $"Curso con ID {id} no encontrado." });

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:guid}/certificate")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadCertificate(Guid id, [FromForm] UploadCertificateFormDto dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = $"Curso con ID {id} no encontrado." });

        var file = dto.File;
        var certificateUrl = dto.CertificateUrl;

        if (file != null && file.Length > 0)
        {
            var allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".jpeg", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Formato de archivo no soportado. Solo se permiten formatos PDF, PNG, JPG, JPEG y WEBP." });
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "certificates");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{id}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            course.CertificateUrl = $"/certificates/{uniqueFileName}";
        }
        else if (!string.IsNullOrWhiteSpace(certificateUrl))
        {
            course.CertificateUrl = certificateUrl.Trim();
        }
        else
        {
            return BadRequest(new { message = "Debes proporcionar un archivo o una URL de certificado válida." });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Certificado adjuntado correctamente.", certificateUrl = course.CertificateUrl });
    }

    [HttpGet("{id:guid}/export-markdown")]
    public async Task<IActionResult> ExportNotesMarkdown(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Notes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = $"Curso con ID {id} no encontrado." });

        var markdown = _exportService.GenerateCourseNotesMarkdown(course);
        var bytes = Encoding.UTF8.GetBytes(markdown);
        var sanitizedTitle = string.Concat(course.Title.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");

        return File(bytes, "text/markdown", $"{sanitizedTitle}_Notes.md");
    }
}
