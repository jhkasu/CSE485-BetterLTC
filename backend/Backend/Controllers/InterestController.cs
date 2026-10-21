using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Email;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/organizations/{orgId:int}/interest")]
[ApiController]
public class InterestController : ControllerBase {
    private readonly AppDbContext _context;
    private readonly IEmailSender _email;

    public InterestController(AppDbContext context, IEmailSender email) {
        _context = context;
        _email = email;
    }

    [HttpPost]
    public async Task<IActionResult> Send(int orgId, InterestRequest request) {
        try {
            var org = await _context.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == orgId && o.IsApproved);
            if (org is null) return NotFound();
            if (request.Website.Length > 0) return Ok();
            if (!request.ConsentGiven) return BadRequest("Consent is required.");
            string name = Regex.Replace(request.Name, @"\s+", " ").Trim();
            string email = AccountEmails.Normalize(request.Email);
            if (name.Length == 0) return BadRequest("Your name is required.");
            if (!new EmailAddressAttribute().IsValid(email)) return BadRequest("A valid email is required.");

            string roleTitle = "";
            if (request.RoleId is int roleId) {
                var role = await _context.VolunteerRoles.AsNoTracking().FirstOrDefaultAsync(r => r.Id == roleId && r.OrganizationId == orgId);
                if (role is null) return BadRequest("Unknown role.");
                roleTitle = role.Title;
            }

            var interest = new VolunteerInterest(
                name,
                email,
                request.Phone.Trim(),
                roleTitle,
                request.Message.Trim(),
                request.Language.StartsWith("fr", StringComparison.OrdinalIgnoreCase));
            string to = org.NotificationEmail.Length > 0 ? org.NotificationEmail : org.Email;
            bool sent = await _email.SendAsync(to, InterestEmails.ToOrganization(org.OrgName, interest));
            if (!sent) return StatusCode(503, "We could not send your message right now. Please try again later.");
            return Ok();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
