using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/notifications")]
[ApiController]
[Authorize]
public class NotificationController : ControllerBase {
    private const int PageSize = 10;
    private readonly AppDbContext _context;

    public NotificationController(AppDbContext context) {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine() {
        try {
            var (role, id) = CurrentAccount();
            if (id is null) return Forbid();
            var items = await _context.Notifications
                .Where(n => n.AccountRole == role && n.AccountId == id.Value)
                .OrderByDescending(n => n.CreatedAt)
                .Take(PageSize)
                .Select(n => new { n.Id, n.Type, n.Subject, n.Detail, n.CreatedAt, read = n.ReadAt != null })
                .ToListAsync();
            int unread = await _context.Notifications
                .CountAsync(n => n.AccountRole == role && n.AccountId == id.Value && n.ReadAt == null);
            return Ok(new { items, unread });
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("me/read")]
    public async Task<IActionResult> MarkAllRead() {
        try {
            var (role, id) = CurrentAccount();
            if (id is null) return Forbid();
            await _context.Notifications
                .Where(n => n.AccountRole == role && n.AccountId == id.Value && n.ReadAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.ReadAt, DateTime.UtcNow));
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private (string Role, int? Id) CurrentAccount() {
        string role = User.FindFirst(Roles.RoleClaim)?.Value ?? "";
        return (role, User.AccountId());
    }
}
