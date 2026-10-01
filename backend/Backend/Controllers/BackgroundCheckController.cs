using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/background-checks")]
[ApiController]
public class BackgroundCheckController : ControllerBase {
    private const long MaxFileSize = 5 * 1024 * 1024;
    private const int ExpiringSoonDays = 30;

    private static readonly Dictionary<string, string> AllowedTypes = new() {
        [".pdf"] = "application/pdf",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
    };

    private readonly AppDbContext _context;

    public BackgroundCheckController(AppDbContext context) {
        _context = context;
    }

    private static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

    [HttpGet("me")]
    [Authorize(Roles = Roles.Volunteer)]
    public async Task<IActionResult> GetMine() {
        try {
            int? id = User.AccountId();
            if (id is null) return Forbid();
            var check = await WithoutFile().FirstOrDefaultAsync(c => c.VolunteerId == id.Value);
            return Ok(check is null ? BackgroundCheckResponse.NotStarted : BackgroundCheckResponse.From(check, Today));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("me/consent")]
    [Authorize(Roles = Roles.Volunteer)]
    public async Task<IActionResult> Consent() {
        try {
            int? id = User.AccountId();
            if (id is null || !await _context.Volunteers.AnyAsync(v => v.Id == id.Value)) return Forbid();
            var check = await _context.BackgroundChecks.FirstOrDefaultAsync(c => c.VolunteerId == id.Value);
            if (check is null) {
                check = new BackgroundCheck {
                    VolunteerId = id.Value,
                    Status = BackgroundCheckStatuses.ConsentGiven,
                    ConsentedAt = DateTime.UtcNow,
                };
                _context.BackgroundChecks.Add(check);
                await _context.SaveChangesAsync();
            }
            return Ok(BackgroundCheckResponse.From(check, Today));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("me/document")]
    [Authorize(Roles = Roles.Volunteer)]
    [RequestSizeLimit(MaxFileSize + 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file) {
        try {
            int? id = User.AccountId();
            if (id is null) return Forbid();
            var check = await _context.BackgroundChecks.FirstOrDefaultAsync(c => c.VolunteerId == id.Value);
            if (check is null) return BadRequest("Please give consent first.");
            if (check.CurrentStatus(Today) == BackgroundCheckStatuses.Approved) return BadRequest("Your background check is already approved.");
            if (file is null || file.Length == 0) return BadRequest("Please choose a file.");
            if (file.Length > MaxFileSize) return BadRequest("The file must be 5 MB or smaller.");
            string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedTypes.TryGetValue(extension, out var contentType)) return BadRequest("Only PDF, JPG, or PNG files are accepted.");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            byte[] data = stream.ToArray();
            if (!MatchesSignature(data, contentType)) return BadRequest("The file does not look like a PDF, JPG, or PNG.");

            check.FileName = Path.GetFileName(file.FileName);
            check.ContentType = contentType;
            check.FileSize = data.Length;
            check.FileData = data;
            check.Status = BackgroundCheckStatuses.Submitted;
            check.SubmittedAt = DateTime.UtcNow;
            check.ReviewedAt = null;
            check.ReviewedByAdminId = null;
            check.RejectionReason = "";
            check.ExpiresOn = null;
            await SetVolunteerApproved(id.Value, false);
            await _context.SaveChangesAsync();
            return Ok(BackgroundCheckResponse.From(check, Today));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("me/document")]
    [Authorize(Roles = Roles.Volunteer)]
    public async Task<IActionResult> RemoveMine() {
        try {
            int? id = User.AccountId();
            if (id is null) return Forbid();
            var check = await _context.BackgroundChecks.FirstOrDefaultAsync(c => c.VolunteerId == id.Value);
            if (check is null || check.FileData is null) return NotFound();
            ClearDocument(check);
            await SetVolunteerApproved(id.Value, false);
            await _context.SaveChangesAsync();
            return Ok(BackgroundCheckResponse.From(check, Today));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}/document")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeleteDocument(int id) {
        try {
            var check = await _context.BackgroundChecks.FindAsync(id);
            if (check is null || check.FileData is null) return NotFound();
            ClearDocument(check);
            check.ReviewedAt = DateTime.UtcNow;
            check.ReviewedByAdminId = User.AccountId();
            await SetVolunteerApproved(check.VolunteerId, false);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAll() {
        try {
            var today = Today;
            var rows = await WithoutFile()
                .Join(_context.Volunteers, c => c.VolunteerId, v => v.Id, (c, v) => new { Check = c, v.FirstName, v.LastName, v.Email })
                .ToListAsync();
            var items = rows
                .Select(r => new BackgroundCheckReviewItem(
                    r.Check.Id,
                    r.Check.VolunteerId,
                    $"{r.FirstName} {r.LastName}".Trim(),
                    r.Email,
                    r.Check.CurrentStatus(today),
                    r.Check.FileName,
                    r.Check.FileSize,
                    r.Check.SubmittedAt,
                    r.Check.ReviewedAt,
                    r.Check.RejectionReason,
                    r.Check.ExpiresOn,
                    r.Check.Status == BackgroundCheckStatuses.Approved
                        && r.Check.ExpiresOn is not null
                        && r.Check.ExpiresOn >= today
                        && r.Check.ExpiresOn <= today.AddDays(ExpiringSoonDays)))
                .OrderBy(i => i.Status == BackgroundCheckStatuses.Submitted ? 0 : 1)
                .ThenByDescending(i => i.SubmittedAt);
            return Ok(items);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}/document")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Document(int id) {
        try {
            var check = await _context.BackgroundChecks.FindAsync(id);
            if (check?.FileData is null) return NotFound();
            return File(check.FileData, check.ContentType, check.FileName);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/approve")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Approve(int id, ApproveBackgroundCheckRequest request) {
        try {
            var check = await _context.BackgroundChecks.FindAsync(id);
            if (check is null) return NotFound();
            if (check.FileData is null) return BadRequest("No document has been uploaded.");
            if (check.IsExpired(Today)) return BadRequest("This check has expired. The volunteer must upload a new document.");
            if (request.ExpiresOn <= Today) return BadRequest("The expiry date must be in the future.");
            check.Status = BackgroundCheckStatuses.Approved;
            check.ExpiresOn = request.ExpiresOn;
            check.RejectionReason = "";
            check.ReviewedAt = DateTime.UtcNow;
            check.ReviewedByAdminId = User.AccountId();
            await SetVolunteerApproved(check.VolunteerId, true);
            Notify(check.VolunteerId, NotificationTypes.BackgroundCheckApproved, request.ExpiresOn.ToString("yyyy-MM-dd"));
            await _context.SaveChangesAsync();
            return Ok(BackgroundCheckResponse.From(check, Today));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/reject")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Reject(int id, RejectBackgroundCheckRequest request) {
        try {
            var check = await _context.BackgroundChecks.FindAsync(id);
            if (check is null) return NotFound();
            string reason = request.Reason.Trim();
            if (reason.Length == 0) return BadRequest("Please give a reason.");
            if (reason.Length > 500) return BadRequest("The reason must be 500 characters or fewer.");
            check.Status = BackgroundCheckStatuses.Rejected;
            check.RejectionReason = reason;
            check.ExpiresOn = null;
            check.ReviewedAt = DateTime.UtcNow;
            check.ReviewedByAdminId = User.AccountId();
            await SetVolunteerApproved(check.VolunteerId, false);
            Notify(check.VolunteerId, NotificationTypes.BackgroundCheckRejected, reason);
            await _context.SaveChangesAsync();
            return Ok(BackgroundCheckResponse.From(check, Today));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private void Notify(int volunteerId, string type, string detail) {
        _context.Notifications.Add(new Notification {
            AccountRole = Roles.Volunteer,
            AccountId = volunteerId,
            Type = type,
            Detail = detail,
            CreatedAt = DateTime.UtcNow,
        });
    }

    private IQueryable<BackgroundCheck> WithoutFile() {
        return _context.BackgroundChecks.AsNoTracking().Select(c => new BackgroundCheck {
            Id = c.Id,
            VolunteerId = c.VolunteerId,
            Status = c.Status,
            ConsentedAt = c.ConsentedAt,
            FileName = c.FileName,
            ContentType = c.ContentType,
            FileSize = c.FileSize,
            SubmittedAt = c.SubmittedAt,
            ReviewedAt = c.ReviewedAt,
            ReviewedByAdminId = c.ReviewedByAdminId,
            RejectionReason = c.RejectionReason,
            ExpiresOn = c.ExpiresOn,
        });
    }

    private static void ClearDocument(BackgroundCheck check) {
        check.FileData = null;
        check.FileName = "";
        check.ContentType = "";
        check.FileSize = 0;
        check.SubmittedAt = null;
        check.ExpiresOn = null;
        check.RejectionReason = "";
        check.Status = BackgroundCheckStatuses.ConsentGiven;
    }

    private async Task SetVolunteerApproved(int volunteerId, bool approved) {
        var volunteer = await _context.Volunteers.FindAsync(volunteerId);
        if (volunteer is not null) volunteer.BackgroundCheckApproved = approved;
    }

    private static bool MatchesSignature(byte[] data, string contentType) {
        return contentType switch {
            "application/pdf" => StartsWith(data, [0x25, 0x50, 0x44, 0x46]),
            "image/png" => StartsWith(data, [0x89, 0x50, 0x4E, 0x47]),
            "image/jpeg" => StartsWith(data, [0xFF, 0xD8, 0xFF]),
            _ => false,
        };
    }

    private static bool StartsWith(byte[] data, byte[] prefix) {
        return data.Length >= prefix.Length && data.AsSpan(0, prefix.Length).SequenceEqual(prefix);
    }
}
