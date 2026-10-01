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
