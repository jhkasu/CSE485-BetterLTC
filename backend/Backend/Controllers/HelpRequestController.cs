using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/help-requests")]
[ApiController]
public class HelpRequestController : ControllerBase {
    private readonly UsersDbContext _context;

    public HelpRequestController(UsersDbContext context) {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAll() {
        try {
            var requests = await _context.HelpRequests.OrderByDescending(r => r.SubmittedAt).ToListAsync();
            return Ok(requests);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(HelpRequest request) {
        try {
            request.SubmittedAt = DateTime.UtcNow;
            _context.HelpRequests.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
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
