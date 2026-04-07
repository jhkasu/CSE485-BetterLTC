using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/volunteers")]
[ApiController]
public class VolunteerController : ControllerBase {
    private readonly UsersDbContext _context;

    public VolunteerController(UsersDbContext context) {
        this._context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddVolunteer(Volunteer volunteer) {
        try {
            _context.Volunteers.Add(volunteer);
            await _context.SaveChangesAsync();
            return Ok(volunteer);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVolunteer(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) {
                return NotFound();
            }
            return Ok(volunteer);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePerson(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) {
                return NotFound();
            }
            _context.Volunteers.Remove(volunteer);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
