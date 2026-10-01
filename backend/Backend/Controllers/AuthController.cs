using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase {
    private readonly UsersDbContext _context;
    private readonly TokenService _tokens;
    private readonly AdminAccount _admin;

    public AuthController(UsersDbContext context, TokenService tokens, AdminAccount admin) {
        this._context = context;
        this._tokens = tokens;
        this._admin = admin;
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request) {
        try {
            string email = AccountEmails.Normalize(request.Email);
            if (_admin.Matches(email, request.Password)) {
                string adminName = $"{_admin.FirstName} {_admin.LastName}".Trim();
                return Ok(new {
                    token = _tokens.Create(0, Roles.Admin, _admin.Email, adminName),
                    user = new { id = 0, firstName = _admin.FirstName, lastName = _admin.LastName, email = _admin.Email, role = Roles.Admin },
                });
            }

            var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.Email.Trim().ToLower() == email);
            if (volunteer is not null && PasswordHashing.Verify(request.Password, volunteer.Password)) {
                var profile = VolunteerResponse.From(volunteer);
                return Ok(new {
                    token = _tokens.Create(volunteer.Id, Roles.Volunteer, volunteer.Email, $"{volunteer.FirstName} {volunteer.LastName}"),
                    user = new { profile.Id, profile.FirstName, profile.LastName, profile.Email, profile.BackgroundCheckApproved, role = Roles.Volunteer },
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
}
