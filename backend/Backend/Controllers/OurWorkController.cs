using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/our-work")]
[ApiController]
public class OurWorkController : ControllerBase {
    private readonly UsersDbContext _context;

    public OurWorkController(UsersDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        try {
            var posts = await _context.OurWorks.OrderByDescending(p => p.Id).ToListAsync();
            return Ok(posts);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) {
        try {
            var post = await _context.OurWorks.FindAsync(id);
            if (post is null) return NotFound();
            return Ok(post);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(OurWork post) {
        try {
            _context.OurWorks.Add(post);
            await _context.SaveChangesAsync();
            return Ok(post);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, OurWork updated) {
        try {
            var post = await _context.OurWorks.FindAsync(id);
            if (post is null) return NotFound();
            post.Title = updated.Title;
            post.Content = updated.Content;
            post.Category = updated.Category;
            post.Date = updated.Date;
            await _context.SaveChangesAsync();
            return Ok(post);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) {
        try {
            var post = await _context.OurWorks.FindAsync(id);
            if (post is null) return NotFound();
            _context.OurWorks.Remove(post);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
