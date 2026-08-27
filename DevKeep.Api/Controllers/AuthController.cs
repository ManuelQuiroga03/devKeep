using DevKeep.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DevKeep.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        var adminSecret = Environment.GetEnvironmentVariable("ADMIN_SECRET_KEY")
                           ?? _config["AdminSecretKey"]
                           ?? "devkeep-admin-2026";

        if (dto != null && dto.Pin == adminSecret)
        {
            return Ok(new { success = true, token = adminSecret });
        }

        return Unauthorized(new { success = false, message = "PIN de administrador incorrecto" });
    }
}
