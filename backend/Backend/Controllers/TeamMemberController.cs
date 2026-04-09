using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/team-members")]
[ApiController]
public class TeamMemberController : ControllerBase {
    private readonly UsersDbContext _context;
    private readonly IWebHostEnvironment _env;

    public TeamMemberController(UsersDbContext context, IWebHostEnvironment env) {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        try {
            var members = await _context.TeamMembers.ToListAsync();
            return Ok(members);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) {
        try {
            var member = await _context.TeamMembers.FindAsync(id);
            if (member is null) return NotFound();
            return Ok(member);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(TeamMember member) {
        try {
            _context.TeamMembers.Add(member);
            await _context.SaveChangesAsync();
            return Ok(member);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, TeamMember updated) {
        try {
            var member = await _context.TeamMembers.FindAsync(id);
            if (member is null) return NotFound();
            member.UserId = updated.UserId;
            member.Name = updated.Name;
            member.Position = updated.Position;
            member.Bio = updated.Bio;
            member.ImagePath = updated.ImagePath;
            await _context.SaveChangesAsync();
            return Ok(member);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file) {
        try {
            if (file is null || file.Length == 0) return BadRequest("No file provided.");
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsPath = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsPath);
            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsPath, fileName);
            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);
            return Ok(new { imagePath = $"/uploads/{fileName}" });
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) {
        try {
            var member = await _context.TeamMembers.FindAsync(id);
            if (member is null) return NotFound();
            _context.TeamMembers.Remove(member);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
