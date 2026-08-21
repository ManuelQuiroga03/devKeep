namespace DevKeep.Api.Models;

public class CheatSheetItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Technology { get; set; } = string.Empty; // e.g. Podman, Docker, Git, .NET, Linux
    public string Category { get; set; } = string.Empty;   // e.g. Contenedores, Redes, Volúmenes, Build, CLI
    public string Command { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsFavorite { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
