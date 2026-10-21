using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/organizations/{orgId:int}/roles")]
[ApiController]
public class VolunteerRoleController : ControllerBase {
    public const int MaxRoles = 10;

    private readonly AppDbContext _context;

    public VolunteerRoleController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int orgId) {
        try {
            bool visible = await _context.Organizations.AnyAsync(o => o.Id == orgId && o.IsApproved)
                || User.IsInRole(Roles.Admin)
                || User.IsAccount(Roles.Organization, orgId);
            if (!visible) return NotFound();
            var roles = await _context.VolunteerRoles.AsNoTracking()
                .Where(r => r.OrganizationId == orgId)
                .OrderBy(r => r.Id)
                .ToListAsync();
            return Ok(roles.Select(VolunteerRoleResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> Create(int orgId, VolunteerRoleRequest request) {
        try {
            if (!CanManage(orgId)) return Forbid();
            if (!await _context.Organizations.AnyAsync(o => o.Id == orgId)) return NotFound();
            string? error = Validate(request);
            if (error is not null) return BadRequest(error);
            int count = await _context.VolunteerRoles.CountAsync(r => r.OrganizationId == orgId);
            if (count >= MaxRoles) return BadRequest($"You can list up to {MaxRoles} roles.");
            var role = new VolunteerRole { OrganizationId = orgId };
            Apply(role, request);
            _context.VolunteerRoles.Add(role);
            await _context.SaveChangesAsync();
            return Ok(VolunteerRoleResponse.From(role));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> Update(int orgId, int id, VolunteerRoleRequest request) {
        try {
            if (!CanManage(orgId)) return Forbid();
            var role = await _context.VolunteerRoles.FirstOrDefaultAsync(r => r.Id == id && r.OrganizationId == orgId);
            if (role is null) return NotFound();
            string? error = Validate(request);
            if (error is not null) return BadRequest(error);
            Apply(role, request);
            await _context.SaveChangesAsync();
            return Ok(VolunteerRoleResponse.From(role));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> Delete(int orgId, int id) {
        try {
            if (!CanManage(orgId)) return Forbid();
            int deleted = await _context.VolunteerRoles.Where(r => r.Id == id && r.OrganizationId == orgId).ExecuteDeleteAsync();
            return deleted == 0 ? NotFound() : NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private bool CanManage(int orgId) {
        return User.IsInRole(Roles.Admin) || User.IsAccount(Roles.Organization, orgId);
    }

    private static string? Validate(VolunteerRoleRequest request) {
        return request.Title.Trim().Length == 0 ? "A role title is required." : null;
    }

    private static void Apply(VolunteerRole role, VolunteerRoleRequest request) {
        role.Title = request.Title.Trim();
        role.TimeCommitment = request.TimeCommitment.Trim();
        role.Description = request.Description.Trim();
    }
}
