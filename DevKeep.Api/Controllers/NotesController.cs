using DevKeep.Api.Data;
using DevKeep.Api.DTOs;
using DevKeep.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevKeep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseNote>>> GetNotes([FromQuery] Guid? courseId, [FromQuery] string? tag)
    {
        var query = _context.CourseNotes.AsQueryable();

        if (courseId.HasValue)
        {
            query = query.Where(n => n.CourseId == courseId.Value);
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            query = query.Where(n => n.Tags.ToLower().Contains(tag.ToLower()));
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CourseNote>> GetNote(Guid id)
    {
        var note = await _context.CourseNotes.FindAsync(id);
        if (note == null) return NotFound(new { message = $"Nota con ID {id} no encontrada." });

        return note;
    }

    [HttpPost]
    public async Task<ActionResult<CourseNote>> CreateNote(CreateNoteDto dto)
    {
        var courseExists = await _context.Courses.AnyAsync(c => c.Id == dto.CourseId);
        if (!courseExists)
        {
            return BadRequest(new { message = $"El curso con ID {dto.CourseId} no existe." });
        }

        var note = new CourseNote
        {
            CourseId = dto.CourseId,
            SectionTitle = dto.SectionTitle,
            LessonTitle = dto.LessonTitle,
            VideoTimestamp = dto.VideoTimestamp,
            DirectUrl = dto.DirectUrl,
            MarkdownContent = dto.MarkdownContent,
            Tags = dto.Tags,
            CreatedAt = DateTime.UtcNow
        };

        _context.CourseNotes.Add(note);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateNote(Guid id, UpdateNoteDto dto)
    {
        var note = await _context.CourseNotes.FindAsync(id);
        if (note == null) return NotFound(new { message = $"Nota con ID {id} no encontrada." });

        note.SectionTitle = dto.SectionTitle;
        note.LessonTitle = dto.LessonTitle;
        note.VideoTimestamp = dto.VideoTimestamp;
        note.DirectUrl = dto.DirectUrl;
        note.MarkdownContent = dto.MarkdownContent;
        note.Tags = dto.Tags;
        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNote(Guid id)
    {
        var note = await _context.CourseNotes.FindAsync(id);
        if (note == null) return NotFound(new { message = $"Nota con ID {id} no encontrada." });

        _context.CourseNotes.Remove(note);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
