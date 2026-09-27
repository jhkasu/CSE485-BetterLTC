using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/listings")]
[ApiController]
public class ListingsController : ControllerBase {
    private readonly ListingsDbContext _context;
    private readonly UsersDbContext _users;

    public ListingsController(ListingsDbContext context, UsersDbContext users) {
        this._context = context;
        this._users = users;
    }

    private async Task<Organization?> CurrentOrganization() {
        int? id = User.AccountId();
        if (!User.IsInRole(Roles.Organization) || id is null) return null;
        return await _users.Organizations.FindAsync(id.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllListings() {
        try {
            var listings = await _context.Listings.OrderByDescending(l => l.Id).ToListAsync();
            return Ok(listings);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> AddListing(Listing listing) {
        try {
            if (!User.IsInRole(Roles.Admin)) {
                var org = await CurrentOrganization();
                if (org is null || !org.IsApproved) return Forbid();
                listing.OrgName = org.OrgName;
            }
            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();
            return Ok(listing);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetListing(int id) {
        try {
            var listing = await _context.Listings.FindAsync(id);
            if (listing is null) return NotFound();
            return Ok(listing);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> UpdateListing(int id, Listing updated) {
        try {
            var listing = await _context.Listings.FindAsync(id);
            if (listing is null) return NotFound();
            if (!User.IsInRole(Roles.Admin)) {
                var org = await CurrentOrganization();
                if (org is null || listing.OrgName != org.OrgName) return Forbid();
                updated.OrgName = org.OrgName;
            }
            listing.ListingTitle = updated.ListingTitle;
            listing.Description = updated.Description;
            listing.Location = updated.Location;
            listing.Days = updated.Days;
            listing.OrgName = updated.OrgName;
            listing.Status = updated.Status;
            listing.StartDate = updated.StartDate;
            listing.EndDate = updated.EndDate;
            listing.Category = updated.Category;
            await _context.SaveChangesAsync();
            return Ok(listing);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> DeleteListing(int id) {
        try {
            var listing = await _context.Listings.FindAsync(id);
            if (listing is null) return NotFound();
            if (!User.IsInRole(Roles.Admin)) {
                var org = await CurrentOrganization();
                if (org is null || listing.OrgName != org.OrgName) return Forbid();
            }
            _context.Listings.Remove(listing);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
