using DevKeep.Api.Data;
using DevKeep.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevKeep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly AppDbContext _context;

    public SearchController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<SearchResultDto>> GlobalSearch([FromQuery] string? q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return new SearchResultDto { QueryTerm = "" };
        }

        var term = q.Trim().ToLower();

        var matchingCourses = await _context.Courses
            .Include(c => c.Notes)
            .Where(c => c.Title.ToLower().Contains(term)
                     || (c.Instructor != null && c.Instructor.ToLower().Contains(term))
                     || c.Platform.ToLower().Contains(term))
            .Take(20)
            .ToListAsync();

        var matchingNotes = await _context.CourseNotes
            .Where(n => n.LessonTitle.ToLower().Contains(term)
                     || (n.SectionTitle != null && n.SectionTitle.ToLower().Contains(term))
                     || n.MarkdownContent.ToLower().Contains(term)
                     || n.Tags.ToLower().Contains(term))
            .Take(50)
            .ToListAsync();

        var matchingCheatSheets = await _context.CheatSheetItems
            .Where(cs => cs.Command.ToLower().Contains(term)
                      || cs.Description.ToLower().Contains(term)
                      || cs.Technology.ToLower().Contains(term)
                      || cs.Category.ToLower().Contains(term))
            .Take(50)
            .ToListAsync();

        return new SearchResultDto
        {
            QueryTerm = q,
            Courses = matchingCourses,
            Notes = matchingNotes,
            CheatSheets = matchingCheatSheets
        };
    }
}
