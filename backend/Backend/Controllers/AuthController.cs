using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase {
    private readonly AppDbContext _context;
    private readonly TokenService _tokens;

    public AuthController(AppDbContext context, TokenService tokens) {
        this._context = context;
        this._tokens = tokens;
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

    private async Task<IAccount?> FindAccount(int id) {
        if (User.IsInRole(Roles.Admin)) return await _context.Admins.FindAsync(id);
        if (User.IsInRole(Roles.Volunteer)) return await _context.Volunteers.FindAsync(id);
        if (User.IsInRole(Roles.Organization)) return await _context.Organizations.FindAsync(id);
        return null;
    }
}
