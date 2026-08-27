using DevKeep.Api.DTOs;
using DevKeep.Api.Middleware;
using DevKeep.Api.Models;
using DevKeep.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevKeep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
    {
        var courses = await _courseService.GetAllCoursesAsync();
        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Course>> GetCourse(Guid id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);
        if (course == null) return NotFound(new { message = "Curso no encontrado" });
        return Ok(course);
    }

    [HttpPost]
    [AdminAuth]
    public async Task<ActionResult<Course>> CreateCourse([FromBody] CreateCourseDto dto)
    {
        var course = await _courseService.CreateCourseAsync(dto);
        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    [HttpPut("{id}")]
    [AdminAuth]
    public async Task<ActionResult<Course>> UpdateCourse(Guid id, [FromBody] UpdateCourseDto dto)
    {
        var updated = await _courseService.UpdateCourseAsync(id, dto);
        if (updated == null) return NotFound(new { message = "Curso no encontrado" });
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [AdminAuth]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var deleted = await _courseService.DeleteCourseAsync(id);
        if (!deleted) return NotFound(new { message = "Curso no encontrado" });
        return NoContent();
    }

    [HttpPost("{id}/certificate")]
    [AdminAuth]
    public async Task<IActionResult> UploadCertificate(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No se adjuntó ningún archivo válido" });

        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { message = "Formato de archivo no permitido" });

        var relativeUrl = await _courseService.UploadCertificateAsync(id, file);
        if (relativeUrl == null) return NotFound(new { message = "Curso no encontrado" });

        return Ok(new { certificateUrl = relativeUrl });
    }
}
