using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Files;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/testimonials")]
[ApiController]
public class TestimonialController : ControllerBase {
    private const long MaxPhotoSize = 2 * 1024 * 1024;
    private static readonly Dictionary<string, string> PhotoTypes = new() {
        [".jpg"] = FileSignatures.Jpeg,
        [".jpeg"] = FileSignatures.Jpeg,
        [".png"] = FileSignatures.Png,
    };

    private readonly AppDbContext _context;

    public TestimonialController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetVisible() {
        try {
            var items = await _context.Testimonials.AsNoTracking()
                .Where(t => t.IsVisible)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            return Ok(items.Select(TestimonialResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("all")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAll() {
        try {
            var items = await _context.Testimonials.AsNoTracking().OrderByDescending(t => t.CreatedAt).ToListAsync();
            return Ok(items.Select(TestimonialResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(TestimonialRequest request) {
        try {
            string? error = Validate(request);
            if (error is not null) return BadRequest(error);
            var item = new Testimonial { CreatedAt = DateTime.UtcNow };
            Apply(item, request);
            _context.Testimonials.Add(item);
            await _context.SaveChangesAsync();
            return Ok(TestimonialResponse.From(item));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, TestimonialRequest request) {
        try {
            var item = await _context.Testimonials.FindAsync(id);
            if (item is null) return NotFound();
            string? error = Validate(request);
            if (error is not null) return BadRequest(error);
            Apply(item, request);
            await _context.SaveChangesAsync();
            return Ok(TestimonialResponse.From(item));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id) {
        try {
            var item = await _context.Testimonials.FindAsync(id);
            if (item is null) return NotFound();
            _context.Testimonials.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}/photo")]
    public async Task<IActionResult> GetPhoto(int id) {
        try {
            bool visible = User.IsInRole(Roles.Admin) || await _context.Testimonials.AnyAsync(t => t.Id == id && t.IsVisible);
            if (!visible) return NotFound();
            var photo = await _context.TestimonialPhotos.AsNoTracking().FirstOrDefaultAsync(p => p.TestimonialId == id);
            if (photo is null) return NotFound();
            Response.Headers.CacheControl = "public, max-age=86400";
            return File(photo.Data, photo.ContentType);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/photo")]
    [Authorize(Roles = Roles.Admin)]
    [RequestSizeLimit(MaxPhotoSize + 1024 * 1024)]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file) {
        try {
            var item = await _context.Testimonials.FindAsync(id);
            if (item is null) return NotFound();
            if (file is null || file.Length == 0) return BadRequest("Please choose an image.");
            if (file.Length > MaxPhotoSize) return BadRequest("The image must be 2 MB or smaller.");
            string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!PhotoTypes.TryGetValue(extension, out var contentType)) return BadRequest("Only JPG or PNG images are accepted.");
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            byte[] data = stream.ToArray();
            if (!FileSignatures.Matches(data, contentType)) return BadRequest("The file does not look like a JPG or PNG image.");

            var photo = await _context.TestimonialPhotos.FindAsync(id);
            if (photo is null) {
                photo = new TestimonialPhoto { TestimonialId = id };
                _context.TestimonialPhotos.Add(photo);
            }
            photo.ContentType = contentType;
            photo.Data = data;
            item.PhotoUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(TestimonialResponse.From(item));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}/photo")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeletePhoto(int id) {
        try {
            var item = await _context.Testimonials.FindAsync(id);
            if (item is null) return NotFound();
            await _context.TestimonialPhotos.Where(p => p.TestimonialId == id).ExecuteDeleteAsync();
            item.PhotoUpdatedAt = null;
            await _context.SaveChangesAsync();
            return Ok(TestimonialResponse.From(item));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private static string? Validate(TestimonialRequest request) {
        if (request.QuoteEn.Trim().Length == 0) return "Please enter the English quote.";
        if (request.Name.Trim().Length == 0) return "Please enter a name.";
        if (!ReferenceData.TestimonialRoles.Contains(request.Role)) return "Unknown role.";
        return null;
    }

    private static void Apply(Testimonial item, TestimonialRequest request) {
        item.QuoteEn = request.QuoteEn.Trim();
        item.QuoteFr = request.QuoteFr.Trim();
        item.Name = request.Name.Trim();
        item.Role = request.Role;
        item.City = request.City.Trim();
        item.IsVisible = request.IsVisible;
    }
}
