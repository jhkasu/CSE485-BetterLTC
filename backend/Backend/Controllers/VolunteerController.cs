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

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> UpdateVolunteer(int id, VolunteerUpdateRequest updated) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Volunteer, id)) return Forbid();
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            volunteer.FirstName = updated.FirstName.Trim();
            volunteer.LastName = updated.LastName.Trim();
            volunteer.Phone = updated.Phone.Trim();
            volunteer.Address = updated.Address.Trim();
            string fullName = $"{volunteer.FirstName} {volunteer.LastName}";
            await _context.Registrations
                .Where(r => r.VolunteerId == id)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.VolunteerName, fullName));
            await _context.SaveChangesAsync();
            return Ok(VolunteerResponse.From(volunteer));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/matching-profile")]
    [Authorize]
    public async Task<IActionResult> UpdateMatchingProfile(int id, VolunteerMatchingProfileRequest profile) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Volunteer, id)) return Forbid();
            var volunteer = await _context.Volunteers.FindAsync(id);
            if (volunteer is null) return NotFound();
            if (!ReferenceData.Cities.Contains(profile.City)) return BadRequest("Please choose a city.");
            var days = Known(profile.AvailableDays, ReferenceData.Days);
            var times = Known(profile.AvailableTimes, ReferenceData.TimesOfDay);
            var interests = Known(profile.Interests, ReferenceData.HelpTypes);
            var languages = Known(profile.Languages, ReferenceData.Languages);
            if (days is null || times is null || interests is null || languages is null) return BadRequest("Unknown value.");
            if (days.Count == 0) return BadRequest("Please choose at least one available day.");
            volunteer.City = profile.City;
            volunteer.AvailableDays = days;
            volunteer.AvailableTimes = times;
            volunteer.Interests = interests;
            volunteer.Languages = languages;
            volunteer.RecommendationConsent = profile.RecommendationConsent;
            await _context.SaveChangesAsync();
            return Ok(VolunteerResponse.From(volunteer));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private static List<string>? Known(List<string> values, string[] allowed) {
        var distinct = values.Distinct().ToList();
        return distinct.All(allowed.Contains) ? distinct : null;
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
