using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;
using Backend.Email;

namespace Backend.Controllers;

[Route("api/help-requests")]
[ApiController]
public class HelpRequestController : ControllerBase {
    private readonly AppDbContext _context;
    private readonly IEmailSender _email;

    public HelpRequestController(AppDbContext context, IEmailSender email) {
        _context = context;
        _email = email;
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAll() {
        try {
            var rows = await _context.HelpRequests
                .OrderByDescending(r => r.SubmittedAt)
                .GroupJoin(_context.Organizations, r => r.OrganizationId, o => o.Id, (r, orgs) => new { Request = r, Orgs = orgs })
                .SelectMany(x => x.Orgs.DefaultIfEmpty(), (x, o) => new { x.Request, OrgName = o == null ? "" : o.OrgName })
                .ToListAsync();
            return Ok(rows.Select(x => new AdminHelpRequestItem(
                x.Request.Id,
                x.Request.FirstName,
                x.Request.LastName,
                x.Request.Email,
                x.Request.Phone,
                x.Request.ContactMethod,
                x.Request.HelpType,
                x.Request.City,
                x.Request.ForFamilyMember,
                x.Request.SeniorName,
                x.Request.Language,
                x.Request.Status,
                x.Request.SubmittedAt,
                x.Request.AcceptedAt,
                x.Request.ContactedAt,
                x.Request.OrganizationId,
                x.OrgName)));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(HelpRequestCreateRequest request) {
        try {
            if (!request.ConsentGiven) return BadRequest("Consent is required.");
            if (request.ContactMethod != "Phone" && request.ContactMethod != "Email") return BadRequest("Invalid contact method.");
            string phone = request.Phone.Trim();
            string email = AccountEmails.Normalize(request.Email);
            if (request.ContactMethod == "Phone" && phone.Count(char.IsDigit) < 10) return BadRequest("A phone number is required.");
            if (request.ContactMethod == "Email" && !new EmailAddressAttribute().IsValid(email)) return BadRequest("A valid email is required.");
            if (request.ForFamilyMember && string.IsNullOrWhiteSpace(request.SeniorName)) return BadRequest("The senior's name is required.");
            var helpRequest = new HelpRequest {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                Phone = phone,
                HelpType = request.HelpType.Trim(),
                City = request.City.Trim(),
                ContactMethod = request.ContactMethod,
                ForFamilyMember = request.ForFamilyMember,
                SeniorName = request.ForFamilyMember ? request.SeniorName.Trim() : "",
                ConsentGiven = true,
                Language = request.Language.StartsWith("fr", StringComparison.OrdinalIgnoreCase) ? "fr" : "en",
                Status = HelpRequestStatuses.New,
                SubmittedAt = DateTime.UtcNow,
            };
            _context.HelpRequests.Add(helpRequest);
            await _context.SaveChangesAsync();
            bool emailSent = helpRequest.Email.Length > 0
                && await _email.SendAsync(helpRequest.Email, HelpRequestEmails.Confirmation(helpRequest, request.Language));
            return Ok(new { helpRequest.Id, helpRequest.Status, emailSent });
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("open")]
    [Authorize(Roles = Roles.Organization)]
    public async Task<IActionResult> GetOpen() {
        try {
            var org = await CurrentApprovedOrganization();
            if (org is null) return Forbid();
            var requests = await _context.HelpRequests
                .Where(r => r.Status == HelpRequestStatuses.New && r.OrganizationId == null)
                .Where(r => org.ServiceAreas.Contains(r.City) && org.HelpTypes.Contains(r.HelpType))
                .OrderBy(r => r.SubmittedAt)
                .ToListAsync();
            return Ok(requests.Select(OpenHelpRequestResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("accepted")]
    [Authorize(Roles = Roles.Organization)]
    public async Task<IActionResult> GetAccepted() {
        try {
            var org = await CurrentApprovedOrganization();
            if (org is null) return Forbid();
            var requests = await _context.HelpRequests
                .Where(r => r.OrganizationId == org.Id)
                .OrderByDescending(r => r.AcceptedAt)
                .ToListAsync();
            return Ok(requests.Select(HelpRequestDetailResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> GetOne(int id) {
        try {
            var request = await _context.HelpRequests.FindAsync(id);
            if (request is null) return NotFound();
            if (!await CanManage(request)) return Forbid();
            return Ok(HelpRequestDetailResponse.From(request));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/accept")]
    [Authorize(Roles = Roles.Organization)]
    public async Task<IActionResult> Accept(int id) {
        try {
            var org = await CurrentApprovedOrganization();
            if (org is null) return Forbid();
            var target = await _context.HelpRequests.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
            if (target is null) return NotFound();
            if (!org.Serves(target.City, target.HelpType)) return Forbid();
            int updated = await _context.HelpRequests
                .Where(r => r.Id == id && r.Status == HelpRequestStatuses.New && r.OrganizationId == null)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(r => r.Status, HelpRequestStatuses.Accepted)
                    .SetProperty(r => r.OrganizationId, org.Id)
                    .SetProperty(r => r.AcceptedAt, DateTime.UtcNow));
            if (updated == 0) return Conflict("This request was already accepted.");
            var request = await _context.HelpRequests.AsNoTracking().FirstAsync(r => r.Id == id);
            return Ok(HelpRequestDetailResponse.From(request));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/contacted")]
    [Authorize(Roles = Roles.Organization)]
    public async Task<IActionResult> MarkContacted(int id) {
        try {
            var org = await CurrentApprovedOrganization();
            if (org is null) return Forbid();
            var request = await _context.HelpRequests.FindAsync(id);
            if (request is null) return NotFound();
            if (request.OrganizationId != org.Id) return Forbid();
            if (request.Status != HelpRequestStatuses.Accepted) return BadRequest("Only accepted requests can be marked as contacted.");
            request.Status = HelpRequestStatuses.Contacted;
            request.ContactedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(HelpRequestDetailResponse.From(request));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/release")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> Release(int id) {
        try {
            var request = await _context.HelpRequests.FindAsync(id);
            if (request is null) return NotFound();
            if (!await CanManage(request) || request.OrganizationId is null) return Forbid();
            request.Status = HelpRequestStatuses.New;
            request.OrganizationId = null;
            request.AcceptedAt = null;
            request.ContactedAt = null;
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private async Task<Organization?> CurrentApprovedOrganization() {
        int? id = User.AccountId();
        if (!User.IsInRole(Roles.Organization) || id is null) return null;
        var org = await _context.Organizations.FindAsync(id.Value);
        return org is { IsApproved: true } ? org : null;
    }

    private async Task<bool> CanManage(HelpRequest request) {
        if (User.IsInRole(Roles.Admin)) return true;
        var org = await CurrentApprovedOrganization();
        return org is not null && request.OrganizationId == org.Id;
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id) {
        try {
            var request = await _context.HelpRequests.FindAsync(id);
            if (request is null) return NotFound();
            _context.HelpRequests.Remove(request);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
