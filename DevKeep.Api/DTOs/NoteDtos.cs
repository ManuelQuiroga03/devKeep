using System.ComponentModel.DataAnnotations;

namespace DevKeep.Api.DTOs;

public record CreateNoteDto(
    [Required(ErrorMessage = "El ID del curso es obligatorio.")]
    Guid CourseId,

    [Required(ErrorMessage = "El título de la lección es obligatorio.")]
    [StringLength(200, ErrorMessage = "El título de la lección no puede exceder los 200 caracteres.")]
    string LessonTitle,

    [Required(ErrorMessage = "El contenido Markdown es obligatorio.")]
    string MarkdownContent,

    [StringLength(150, ErrorMessage = "El título de la sección no puede exceder los 150 caracteres.")]
    string? SectionTitle = null,

    [StringLength(20, ErrorMessage = "La marca de tiempo no puede exceder los 20 caracteres.")]
    string? VideoTimestamp = null,

    [Url(ErrorMessage = "El enlace directo debe ser una URL válida.")]
    [StringLength(300, ErrorMessage = "La URL no puede exceder los 300 caracteres.")]
    string? DirectUrl = null,

    [StringLength(200, ErrorMessage = "Las etiquetas no pueden exceder los 200 caracteres.")]
    string Tags = ""
);

public record UpdateNoteDto(
    [Required(ErrorMessage = "El título de la lección es obligatorio.")]
    [StringLength(200, ErrorMessage = "El título de la lección no puede exceder los 200 caracteres.")]
    string LessonTitle,

    [Required(ErrorMessage = "El contenido Markdown es obligatorio.")]
    string MarkdownContent,

    [StringLength(150, ErrorMessage = "El título de la sección no puede exceder los 150 caracteres.")]
    string? SectionTitle,

    [StringLength(20, ErrorMessage = "La marca de tiempo no puede exceder los 20 caracteres.")]
    string? VideoTimestamp,

    [Url(ErrorMessage = "El enlace directo debe ser una URL válida.")]
    [StringLength(300, ErrorMessage = "La URL no puede exceder los 300 caracteres.")]
    string? DirectUrl,

    [StringLength(200, ErrorMessage = "Las etiquetas no pueden exceder los 200 caracteres.")]
    string Tags
);
