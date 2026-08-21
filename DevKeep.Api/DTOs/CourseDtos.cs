using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DevKeep.Api.DTOs;

public record CreateCourseDto(
    [Required(ErrorMessage = "El título del curso es obligatorio.")]
    [StringLength(150, ErrorMessage = "El título no puede exceder los 150 caracteres.")]
    string Title,

    [Required(ErrorMessage = "La plataforma es obligatoria.")]
    [StringLength(50, ErrorMessage = "La plataforma no puede exceder los 50 caracteres.")]
    string Platform,

    [StringLength(100, ErrorMessage = "El nombre del instructor no puede exceder los 100 caracteres.")]
    string? Instructor = null,

    [Url(ErrorMessage = "El enlace del curso debe ser una URL válida.")]
    [StringLength(300, ErrorMessage = "La URL no puede exceder los 300 caracteres.")]
    string? CourseUrl = null,

    [Range(0, 1000, ErrorMessage = "El total de capítulos debe estar entre 0 y 1000.")]
    int TotalChapters = 0,

    [Range(0, 1000, ErrorMessage = "El capítulo actual debe estar entre 0 y 1000.")]
    int CurrentChapter = 0,

    [Range(0, 10000, ErrorMessage = "El total de lecciones debe estar entre 0 y 10000.")]
    int TotalLessons = 0,

    [Range(0, 10000, ErrorMessage = "Las lecciones completadas deben estar entre 0 y 10000.")]
    int CompletedLessons = 0,

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [StringLength(30, ErrorMessage = "El estado no puede exceder los 30 caracteres.")]
    string Status = "In Progress",

    [StringLength(500, ErrorMessage = "La URL del certificado no puede exceder los 500 caracteres.")]
    string? CertificateUrl = null
);

public record UpdateCourseDto(
    [Required(ErrorMessage = "El título del curso es obligatorio.")]
    [StringLength(150, ErrorMessage = "El título no puede exceder los 150 caracteres.")]
    string Title,

    [Required(ErrorMessage = "La plataforma es obligatoria.")]
    [StringLength(50, ErrorMessage = "La plataforma no puede exceder los 50 caracteres.")]
    string Platform,

    [StringLength(100, ErrorMessage = "El nombre del instructor no puede exceder los 100 caracteres.")]
    string? Instructor,

    [Url(ErrorMessage = "El enlace del curso debe ser una URL válida.")]
    [StringLength(300, ErrorMessage = "La URL no puede exceder los 300 caracteres.")]
    string? CourseUrl,

    [Range(0, 1000, ErrorMessage = "El total de capítulos debe estar entre 0 y 1000.")]
    int TotalChapters,

    [Range(0, 1000, ErrorMessage = "El capítulo actual debe estar entre 0 y 1000.")]
    int CurrentChapter,

    [Range(0, 10000, ErrorMessage = "El total de lecciones debe estar entre 0 y 10000.")]
    int TotalLessons,

    [Range(0, 10000, ErrorMessage = "Las lecciones completadas deben estar entre 0 y 10000.")]
    int CompletedLessons,

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [StringLength(30, ErrorMessage = "El estado no puede exceder los 30 caracteres.")]
    string Status,

    [StringLength(500, ErrorMessage = "La URL del certificado no puede exceder los 500 caracteres.")]
    string? CertificateUrl = null
);

public class UploadCertificateFormDto
{
    public IFormFile? File { get; set; }
    public string? CertificateUrl { get; set; }
}
