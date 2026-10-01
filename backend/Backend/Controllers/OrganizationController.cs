using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/organizations")]
[ApiController]
public class OrganizationController : ControllerBase {
    private readonly AppDbContext _context;

    public OrganizationController(AppDbContext context) {
        this._context = context;
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAllOrganizations() {
        try {
            var orgs = await _context.Organizations.OrderByDescending(o => o.Id).ToListAsync();
            return Ok(orgs.Select(OrganizationResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddOrganization(Organization org) {
        try {
            org.Email = AccountEmails.Normalize(org.Email);
            if (await AccountEmails.IsTaken(_context, org.Email)) return Conflict(AccountEmails.AlreadyRegistered);
            org.Password = PasswordHashing.Hash(org.Password);
            _context.Organizations.Add(org);
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetOrganization(int id) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Organization, id)) return Forbid();
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> UpdateOrganization(int id, OrganizationUpdateRequest updated) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            org.OrgName = updated.OrgName;
            org.ContactName = updated.ContactName;
            org.Email = updated.Email;
            org.IsApproved = updated.IsApproved;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/profile")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> UpdateProfile(int id, OrganizationProfileRequest profile) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Organization, id)) return Forbid();
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            var areas = profile.ServiceAreas.Distinct().ToList();
            var helpTypes = profile.HelpTypes.Distinct().ToList();
            if (areas.Any(a => !ReferenceData.Cities.Contains(a))) return BadRequest("Unknown service area.");
            if (helpTypes.Any(h => !ReferenceData.HelpTypes.Contains(h))) return BadRequest("Unknown help type.");
            string notificationEmail = AccountEmails.Normalize(profile.NotificationEmail);
            if (notificationEmail.Length > 0 && !new EmailAddressAttribute().IsValid(notificationEmail)) return BadRequest("Invalid notification email.");
            string orgName = profile.OrgName.Trim();
            if (orgName.Length == 0) return BadRequest("Organization name is required.");

            org.OrgName = orgName;
            org.Description = profile.Description.Trim();
            org.ServiceAreas = areas;
            org.HelpTypes = helpTypes;
            org.NotificationEmail = notificationEmail;
            await _context.Listings
                .Where(l => l.OrganizationId == id)
                .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrgName, orgName));
            await _context.Registrations
                .Where(r => _context.Listings.Any(l => l.Id == r.ListingId && l.OrganizationId == id))
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.OrgName, orgName));
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/approve")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> ApproveOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            org.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/revoke")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RevokeOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            org.IsApproved = false;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeleteOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            _context.Organizations.Remove(org);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
