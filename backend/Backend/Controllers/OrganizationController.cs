using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/organizations")]
[ApiController]
public class OrganizationController : ControllerBase {
    private readonly UsersDbContext _context;

    public OrganizationController(UsersDbContext context) {
        this._context = context;
    }

[HttpPost]
public async Task<IActionResult> AddOrganization(Organization org) {
    try {
        _context.Organizations.Add(org);
        await _context.SaveChangesAsync();
        return Ok(org);
    } catch (Exception ex) {
        return StatusCode(500, ex.Message);
    }
}

[HttpGet("{id:int}")]
public async Task<IActionResult> GetOrganization(int id) {
    try {
        var org = await _context.Organizations.FindAsync(id);
        if (org is null) {
            return NotFound();
        }
        return Ok(org);
    } catch (Exception ex) {
        return StatusCode(500, ex.Message);
    }
}

[HttpDelete("{id:int}")]
public async Task<IActionResult> DeleteOrganization(int id) {
    try {
        var org = await _context.Organizations.FindAsync(id);
        if (org is null) {
            return NotFound();
        }
        _context.Organizations.Remove(org);
        await _context.SaveChangesAsync();
        return NoContent();
    } catch (Exception ex) {
        return StatusCode(500, ex.Message);
    }
}

} //OrganizationController
