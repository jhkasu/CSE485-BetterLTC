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

    [HttpGet]
    public async Task<IActionResult> GetAllVolunteers() {
        try {
            var volunteers = await _context.Volunteers.OrderByDescending(v => v.Id).ToListAsync();
            return Ok(volunteers);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/approve-bgcheck")]
    public async Task<IActionResult> ApproveBgCheck(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            volunteer.BackgroundCheckApproved = true;
            await _context.SaveChangesAsync();
            return Ok(volunteer);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/revoke-bgcheck")]
    public async Task<IActionResult> RevokeBgCheck(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            volunteer.BackgroundCheckApproved = false;
            await _context.SaveChangesAsync();
            return Ok(volunteer);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
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

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request) {
        try {
            var volunteer = await _context.Volunteers
                .FirstOrDefaultAsync(v => v.Email == request.Email && v.Password == request.Password);
            if (volunteer is null) return NotFound();
            return Ok(volunteer);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVolunteer(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            return Ok(volunteer);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVolunteer(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            _context.Volunteers.Remove(volunteer);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
