using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DevKeep.Api.Middleware;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminAuthAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var expectedToken = Environment.GetEnvironmentVariable("ADMIN_SECRET_KEY")
                            ?? config["AdminSecretKey"]
                            ?? "devkeep-admin-2026";

        if (!context.HttpContext.Request.Headers.TryGetValue("X-Admin-Token", out var extractedToken) ||
            extractedToken != expectedToken)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Acceso denegado. Se requieren permisos de administrador." });
            return;
        }

        await next();
    }
}
