using DevKeep.Api.Models;

namespace DevKeep.Api.DTOs;

public class SearchResultDto
{
    public string QueryTerm { get; set; } = string.Empty;
    public int TotalMatches => Courses.Count + Notes.Count + CheatSheets.Count;
    public List<Course> Courses { get; set; } = new();
    public List<CourseNote> Notes { get; set; } = new();
    public List<CheatSheetItem> CheatSheets { get; set; } = new();
}
