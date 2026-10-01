using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/registrations")]
[ApiController]
public class RegistrationController : ControllerBase {
    private readonly AppDbContext _context;

    public RegistrationController(AppDbContext context) {
        _context = context;
    }

    private async Task<Organization?> CurrentOrganization() {
        int? id = User.AccountId();
        if (!User.IsInRole(Roles.Organization) || id is null) return null;
        return await _context.Organizations.FindAsync(id.Value);
    }

    [HttpGet]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> GetAll() {
        try {
            var query = _context.Registrations.AsQueryable();
            if (!User.IsInRole(Roles.Admin)) {
                var org = await CurrentOrganization();
                if (org is null) return Forbid();
                query = query.Where(r => _context.Listings.Any(l => l.Id == r.ListingId && l.OrganizationId == org.Id));
            }
            var list = await query.OrderByDescending(r => r.Id).ToListAsync();
            return Ok(list);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("volunteer/{volunteerId:int}")]
    [Authorize]
    public async Task<IActionResult> GetByVolunteer(int volunteerId) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Volunteer, volunteerId)) return Forbid();
            var list = await _context.Registrations
                .Where(r => r.VolunteerId == volunteerId)
                .OrderByDescending(r => r.Id)
                .ToListAsync();
            return Ok(list);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("listing/{listingId:int}")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> GetByListing(int listingId) {
        try {
            if (!User.IsInRole(Roles.Admin)) {
                var org = await CurrentOrganization();
                var listing = await _context.Listings.FindAsync(listingId);
                if (org is null || listing is null || listing.OrganizationId != org.Id) return Forbid();
            }
            var list = await _context.Registrations
                .Where(r => r.ListingId == listingId)
                .OrderByDescending(r => r.Id)
                .ToListAsync();
            return Ok(list);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = Roles.Volunteer)]
    public async Task<IActionResult> Register([FromBody] Registration reg) {
        try {
            int? volunteerId = User.AccountId();
            var volunteer = volunteerId is null ? null : await _context.Volunteers.FindAsync(volunteerId.Value);
            if (volunteer is null) return Forbid();
            var listing = await _context.Listings.FindAsync(reg.ListingId);
            if (listing is null) return NotFound();
            reg.VolunteerId = volunteer.Id;
            reg.VolunteerName = $"{volunteer.FirstName} {volunteer.LastName}";
            reg.VolunteerEmail = volunteer.Email;
            reg.ListingTitle = listing.ListingTitle;
            reg.OrgName = listing.OrgName;
            var exists = await _context.Registrations
                .AnyAsync(r => r.VolunteerId == reg.VolunteerId && r.ListingId == reg.ListingId);
            if (exists) return Conflict("Already registered.");
            reg.RegisteredAt = DateTime.UtcNow.ToString("yyyy-MM-dd");
            reg.Status = "Pending";
            _context.Registrations.Add(reg);
            await _context.SaveChangesAsync();
            return Ok(reg);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status) {
        try {
            var reg = await _context.Registrations.FindAsync(id);
            if (reg is null) return NotFound();
            if (!User.IsInRole(Roles.Admin)) {
                var org = await CurrentOrganization();
                var listing = await _context.Listings.FindAsync(reg.ListingId);
                if (org is null || listing is null || listing.OrganizationId != org.Id) return Forbid();
            }
            reg.Status = status;
            await _context.SaveChangesAsync();
            return Ok(reg);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
