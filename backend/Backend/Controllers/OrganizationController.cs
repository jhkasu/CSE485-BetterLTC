using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/organizations")]
[ApiController]
public class OrganizationController : ControllerBase {
    private readonly UsersDbContext _context;

    public OrganizationController(UsersDbContext context) {
        this._context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrganizations() {
        try {
            var orgs = await _context.Organizations.OrderByDescending(o => o.Id).ToListAsync();
            return Ok(orgs.Select(OrganizationResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request) {
        try {
            var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Email == request.Email);
            if (org is null || !PasswordHashing.Verify(request.Password, org.Password)) return NotFound();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddOrganization(Organization org) {
        try {
            
            // Reject duplicate organization email before inserting
            bool exists = await _context.Organizations.AnyAsync(o => o.Email == org.Email);
            if (exists) return Conflict("Organization with this email already exists.");
            org.Password = PasswordHashing.Hash(org.Password);
            _context.Organizations.Add(org);
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
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
