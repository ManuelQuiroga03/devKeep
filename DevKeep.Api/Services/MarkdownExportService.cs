using System.Text;
using DevKeep.Api.Models;

namespace DevKeep.Api.Services;

public interface IMarkdownExportService
{
    string GenerateCourseNotesMarkdown(Course course);
}

public class MarkdownExportService : IMarkdownExportService
{
    public string GenerateCourseNotesMarkdown(Course course)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"# {course.Title}");
        sb.AppendLine();
        sb.AppendLine($"**Plataforma**: {course.Platform}");
        if (!string.IsNullOrWhiteSpace(course.Instructor))
            sb.AppendLine($"**Instructor**: {course.Instructor}");
        if (!string.IsNullOrWhiteSpace(course.CourseUrl))
            sb.AppendLine($"**Enlace**: [{course.CourseUrl}]({course.CourseUrl})");
        sb.AppendLine($"**Estado**: {course.Status} ({course.CompletedLessons}/{course.TotalLessons} lecciones - {course.ProgressPercentage}%)");
        sb.AppendLine($"**Exportado el**: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
        sb.AppendLine();
        sb.AppendLine("---");
        sb.AppendLine();

        if (course.Notes == null || !course.Notes.Any())
        {
            sb.AppendLine("_No hay notas registradas para este curso._");
            return sb.ToString();
        }

        var groupedNotes = course.Notes
            .OrderBy(n => n.CreatedAt)
            .GroupBy(n => string.IsNullOrWhiteSpace(n.SectionTitle) ? "General" : n.SectionTitle);

        foreach (var group in groupedNotes)
        {
            sb.AppendLine($"## {group.Key}");
            sb.AppendLine();

            foreach (var note in group)
            {
                sb.AppendLine($"### {note.LessonTitle}");
                if (!string.IsNullOrWhiteSpace(note.VideoTimestamp))
                    sb.AppendLine($"> ⏱ **Marca de tiempo**: `{note.VideoTimestamp}`");
                if (!string.IsNullOrWhiteSpace(note.DirectUrl))
                    sb.AppendLine($"> 🔗 **Enlace directo**: [{note.DirectUrl}]({note.DirectUrl})");
                if (!string.IsNullOrWhiteSpace(note.Tags))
                    sb.AppendLine($"> 🏷 **Etiquetas**: `{note.Tags}`");
                
                sb.AppendLine();
                sb.AppendLine(note.MarkdownContent);
                sb.AppendLine();
                sb.AppendLine("---");
                sb.AppendLine();
            }
        }

        return sb.ToString();
    }
}
