using System.Text.Json.Serialization;

namespace DevKeep.Api.Models;

public class CourseNote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    
    [JsonIgnore]
    public Course? Course { get; set; }

    public string? SectionTitle { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public string? VideoTimestamp { get; set; }
    public string? DirectUrl { get; set; }
    public string MarkdownContent { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty; // Comma-separated or tag list string
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
