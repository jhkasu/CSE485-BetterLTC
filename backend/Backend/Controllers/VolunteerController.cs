using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/volunteers")]
[ApiController]
public class VolunteerController : ControllerBase {
    private readonly AppDbContext _context;

    public VolunteerController(AppDbContext context) {
        this._context = context;
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAllVolunteers() {
        try {
            var volunteers = await _context.Volunteers.OrderByDescending(v => v.Id).ToListAsync();
            return Ok(volunteers.Select(VolunteerResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/approve-bgcheck")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> ApproveBgCheck(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            volunteer.BackgroundCheckApproved = true;
            await _context.SaveChangesAsync();
            return Ok(VolunteerResponse.From(volunteer));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/revoke-bgcheck")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RevokeBgCheck(int id) {
        try {
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            volunteer.BackgroundCheckApproved = false;
            await _context.SaveChangesAsync();
            return Ok(VolunteerResponse.From(volunteer));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddVolunteer(Volunteer volunteer) {
        try {
            volunteer.Email = AccountEmails.Normalize(volunteer.Email);
            if (await AccountEmails.IsTaken(_context, volunteer.Email)) return Conflict(AccountEmails.AlreadyRegistered);
            volunteer.Password = PasswordHashing.Hash(volunteer.Password);
            _context.Volunteers.Add(volunteer);
            await _context.SaveChangesAsync();
            return Ok(VolunteerResponse.From(volunteer));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetVolunteer(int id) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Volunteer, id)) return Forbid();
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            return Ok(VolunteerResponse.From(volunteer));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
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
