using System.ComponentModel.DataAnnotations;

namespace DevKeep.Api.DTOs;

public record CreateCheatSheetDto(
    [Required(ErrorMessage = "La tecnología es obligatoria.")]
    [StringLength(50, ErrorMessage = "La tecnología no puede exceder los 50 caracteres.")]
    string Technology,

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [StringLength(50, ErrorMessage = "La categoría no puede exceder los 50 caracteres.")]
    string Category,

    [Required(ErrorMessage = "El comando es obligatorio.")]
    [StringLength(500, ErrorMessage = "El comando no puede exceder los 500 caracteres.")]
    string Command,

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres.")]
    string Description,

    bool IsFavorite = false
);

public record UpdateCheatSheetDto(
    [Required(ErrorMessage = "La tecnología es obligatoria.")]
    [StringLength(50, ErrorMessage = "La tecnología no puede exceder los 50 caracteres.")]
    string Technology,

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [StringLength(50, ErrorMessage = "La categoría no puede exceder los 50 caracteres.")]
    string Category,

    [Required(ErrorMessage = "El comando es obligatorio.")]
    [StringLength(500, ErrorMessage = "El comando no puede exceder los 500 caracteres.")]
    string Command,

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres.")]
    string Description,

    bool IsFavorite
);
