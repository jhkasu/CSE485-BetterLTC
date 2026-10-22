using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Email;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase {
    private readonly AppDbContext _context;
    private readonly TokenService _tokens;
    private readonly IEmailSender _email;
    private readonly SiteOrigins _site;

    public AuthController(AppDbContext context, TokenService tokens, IEmailSender email, SiteOrigins site) {
        this._context = context;
        this._tokens = tokens;
        _email = email;
        _site = site;
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request) {
        try {
            string email = AccountEmails.Normalize(request.Email);
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email.Trim().ToLower() == email);
            if (admin is not null && PasswordHashing.Verify(request.Password, admin.Password)) {
                string adminName = $"{admin.FirstName} {admin.LastName}".Trim();
                return Ok(new {
                    token = _tokens.Create(admin.Id, Roles.Admin, admin.Email, adminName),
                    user = new { admin.Id, admin.FirstName, admin.LastName, admin.Email, role = Roles.Admin },
                });
            }

            var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.Email.Trim().ToLower() == email);
            if (volunteer is not null && PasswordHashing.Verify(request.Password, volunteer.Password)) {
                var profile = VolunteerResponse.From(volunteer);
                return Ok(new {
                    token = _tokens.Create(volunteer.Id, Roles.Volunteer, volunteer.Email, $"{volunteer.FirstName} {volunteer.LastName}"),
                    user = new { profile.Id, profile.FirstName, profile.LastName, profile.Email, role = Roles.Volunteer },
                });
            }

            var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Email.Trim().ToLower() == email);
            if (org is not null && PasswordHashing.Verify(request.Password, org.Password)) {
                var profile = OrganizationResponse.From(org);
                return Ok(new {
                    token = _tokens.Create(org.Id, Roles.Organization, org.Email, org.OrgName),
                    user = new { profile.Id, profile.OrgName, profile.ContactName, profile.Email, profile.IsApproved, role = Roles.Organization },
                });
            }

            return Unauthorized();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request) {
        try {
            int? id = User.AccountId();
            if (id is null) return Forbid();
            var account = await FindAccount(id.Value);
            if (account is null) return Forbid();
            if (!PasswordHashing.Verify(request.CurrentPassword, account.Password)) return BadRequest("Current password is incorrect.");
            account.Password = PasswordHashing.Hash(request.NewPassword);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request) {
        try {
            string normalized = AccountEmails.Normalize(request.Email);
            if (normalized.Length == 0) return NoContent();
            var found = await PasswordResets.FindByEmail(_context, normalized);
            string? site = _site.For(Request);
            if (found is null || site is null) return NoContent();
            var now = DateTime.UtcNow;
            var previous = await _context.PasswordResetTokens
                .Where(t => t.Role == found.Role && t.AccountId == found.Id && t.UsedAt == null)
                .ToListAsync();
            if (previous.Any(t => t.CreatedAt > now - PasswordResets.ResendWait)) return NoContent();
            _context.PasswordResetTokens.RemoveRange(previous);
            string token = PasswordResets.NewToken();
            _context.PasswordResetTokens.Add(new PasswordResetToken {
                Role = found.Role,
                AccountId = found.Id,
                TokenHash = PasswordResets.Hash(token),
                CreatedAt = now,
                ExpiresAt = now + PasswordResets.Lifetime,
            });
            await _context.SaveChangesAsync();
            bool french = request.Language.StartsWith("fr", StringComparison.OrdinalIgnoreCase);
            await _email.SendAsync(found.Email, PasswordResetEmails.Link($"{site}/reset-password?token={token}", french));
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request) {
        try {
            const string invalid = "This link is invalid or has expired.";
            string hash = PasswordResets.Hash(request.Token.Trim());
            var reset = await _context.PasswordResetTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
            if (reset is null || reset.UsedAt is not null || reset.ExpiresAt <= DateTime.UtcNow) return BadRequest(invalid);
            var account = await PasswordResets.FindById(_context, reset.Role, reset.AccountId);
            if (account is null) return BadRequest(invalid);
            account.Password = PasswordHashing.Hash(request.NewPassword);
            reset.UsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private async Task<IAccount?> FindAccount(int id) {
        if (User.IsInRole(Roles.Admin)) return await _context.Admins.FindAsync(id);
        if (User.IsInRole(Roles.Volunteer)) return await _context.Volunteers.FindAsync(id);
        if (User.IsInRole(Roles.Organization)) return await _context.Organizations.FindAsync(id);
        return null;
    }
}
