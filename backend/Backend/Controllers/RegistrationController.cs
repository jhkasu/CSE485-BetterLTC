using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/registrations")]
[ApiController]
public class RegistrationController : ControllerBase {
    private readonly ListingsDbContext _context;

    public RegistrationController(ListingsDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        try {
            var list = await _context.Registrations.OrderByDescending(r => r.Id).ToListAsync();
            return Ok(list);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("volunteer/{volunteerId:int}")]
    public async Task<IActionResult> GetByVolunteer(int volunteerId) {
        try {
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
    public async Task<IActionResult> GetByListing(int listingId) {
        try {
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
    public async Task<IActionResult> Register([FromBody] Registration reg) {
        try {
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
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status) {
        try {
            var reg = await _context.Registrations.FindAsync(id);
            if (reg is null) return NotFound();
            reg.Status = status;
            await _context.SaveChangesAsync();
            return Ok(reg);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
