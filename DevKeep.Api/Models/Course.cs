using System.Text.Json.Serialization;

namespace DevKeep.Api.Models;

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty; // e.g. Udemy, YouTube, Platzi, Doc, Libro
    public string? Instructor { get; set; }
    public string? CourseUrl { get; set; }
    public int TotalChapters { get; set; } = 0;
    public int CurrentChapter { get; set; } = 0;
    public int TotalLessons { get; set; } = 0;
    public int CompletedLessons { get; set; } = 0;
    public string Status { get; set; } = "In Progress"; // Not Started, In Progress, Completed
    public string? CertificateUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<CourseNote> Notes { get; set; } = new();

    public decimal ProgressPercentage
    {
        get
        {
            if (Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                return 100m;
            
            // Prioritize fine-grained chapter progress when TotalChapters is defined
            if (TotalChapters > 0)
                return Math.Min(100m, Math.Round((decimal)CurrentChapter / TotalChapters * 100, 2));

            // Fallback to lessons progress
            if (TotalLessons > 0)
                return Math.Min(100m, Math.Round((decimal)CompletedLessons / TotalLessons * 100, 2));

            return 0m;
        }
    }
}
