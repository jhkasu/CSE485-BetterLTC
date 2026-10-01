using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/help-requests")]
[ApiController]
public class HelpRequestController : ControllerBase {
    private readonly AppDbContext _context;

    public HelpRequestController(AppDbContext context) {
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
    public async Task<IActionResult> Create(HelpRequestCreateRequest request) {
        try {
            if (!request.ConsentGiven) return BadRequest("Consent is required.");
            if (request.ContactMethod != "Phone" && request.ContactMethod != "Email") return BadRequest("Invalid contact method.");
            string phone = request.Phone.Trim();
            string email = AccountEmails.Normalize(request.Email);
            if (request.ContactMethod == "Phone" && phone.Count(char.IsDigit) < 10) return BadRequest("A phone number is required.");
            if (request.ContactMethod == "Email" && !new EmailAddressAttribute().IsValid(email)) return BadRequest("A valid email is required.");
            if (request.ForFamilyMember && string.IsNullOrWhiteSpace(request.SeniorName)) return BadRequest("The senior's name is required.");
            var helpRequest = new HelpRequest {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                Phone = phone,
                HelpType = request.HelpType.Trim(),
                City = request.City.Trim(),
                ContactMethod = request.ContactMethod,
                ForFamilyMember = request.ForFamilyMember,
                SeniorName = request.ForFamilyMember ? request.SeniorName.Trim() : "",
                ConsentGiven = true,
                Status = "New",
                SubmittedAt = DateTime.UtcNow,
            };
            _context.HelpRequests.Add(helpRequest);
            await _context.SaveChangesAsync();
            return Ok(new { helpRequest.Id, helpRequest.Status });
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
