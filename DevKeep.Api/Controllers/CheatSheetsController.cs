using DevKeep.Api.Data;
using DevKeep.Api.DTOs;
using DevKeep.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevKeep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheatSheetsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CheatSheetsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CheatSheetItem>>> GetCheatSheets(
        [FromQuery] string? technology,
        [FromQuery] string? category,
        [FromQuery] bool? isFavorite)
    {
        var query = _context.CheatSheetItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(technology))
        {
            query = query.Where(c => c.Technology.ToLower() == technology.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(c => c.Category.ToLower() == category.ToLower());
        }

        if (isFavorite.HasValue)
        {
            query = query.Where(c => c.IsFavorite == isFavorite.Value);
        }

        return await query
            .OrderByDescending(c => c.IsFavorite)
            .ThenByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CheatSheetItem>> GetCheatSheet(Guid id)
    {
        var item = await _context.CheatSheetItems.FindAsync(id);
        if (item == null) return NotFound(new { message = $"Atajo con ID {id} no encontrado." });

        return item;
    }

    [HttpPost]
    public async Task<ActionResult<CheatSheetItem>> CreateCheatSheet(CreateCheatSheetDto dto)
    {
        var item = new CheatSheetItem
        {
            Technology = dto.Technology,
            Category = dto.Category,
            Command = dto.Command,
            Description = dto.Description,
            IsFavorite = dto.IsFavorite,
            CreatedAt = DateTime.UtcNow
        };

        _context.CheatSheetItems.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCheatSheet), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCheatSheet(Guid id, UpdateCheatSheetDto dto)
    {
        var item = await _context.CheatSheetItems.FindAsync(id);
        if (item == null) return NotFound(new { message = $"Atajo con ID {id} no encontrado." });

        item.Technology = dto.Technology;
        item.Category = dto.Category;
        item.Command = dto.Command;
        item.Description = dto.Description;
        item.IsFavorite = dto.IsFavorite;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCheatSheet(Guid id)
    {
        var item = await _context.CheatSheetItems.FindAsync(id);
        if (item == null) return NotFound(new { message = $"Atajo con ID {id} no encontrado." });

        _context.CheatSheetItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
