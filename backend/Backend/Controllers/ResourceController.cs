using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Files;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/resources")]
[ApiController]
public class ResourceController : ControllerBase {
    public const long MaxFileSize = 5 * 1024 * 1024;
    public static readonly Dictionary<string, string> AllowedTypes = new() {
        [".pdf"] = FileSignatures.Pdf,
        [".docx"] = FileSignatures.Docx,
    };

    private readonly AppDbContext _context;

    public ResourceController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        try {
            var resources = await _context.Resources.AsNoTracking()
                .OrderBy(r => r.Audience).ThenBy(r => r.Topic).ThenBy(r => r.Title)
                .ToListAsync();
            return Ok(resources.Select(ResourceResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}/file")]
    public async Task<IActionResult> Download(int id) {
        try {
            var resource = await _context.Resources.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
            var file = await _context.ResourceFiles.AsNoTracking().FirstOrDefaultAsync(f => f.ResourceId == id);
            if (resource is null || file is null) return NotFound();
            await StatisticsController.RecordDownload(_context, id, Request.Headers.UserAgent);
            return File(file.Data, resource.ContentType, resource.FileName);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    [RequestSizeLimit(MaxFileSize + 1024 * 1024)]
    public async Task<IActionResult> Create([FromForm] ResourceForm form) {
        try {
            string? error = Validate(form);
            if (error is not null) return BadRequest(error);
            if (form.File is null) return BadRequest("Please choose a file.");
            var (data, contentType, fileError) = await ReadFile(form.File);
            if (fileError is not null) return BadRequest(fileError);

            var now = DateTime.UtcNow;
            var resource = new Resource { CreatedAt = now };
            Apply(resource, form, now);
            SetFile(resource, form.File.FileName, contentType!, data!.Length);
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();
            _context.ResourceFiles.Add(new ResourceFile { ResourceId = resource.Id, Data = data });
            await _context.SaveChangesAsync();
            return Ok(ResourceResponse.From(resource));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    [RequestSizeLimit(MaxFileSize + 1024 * 1024)]
    public async Task<IActionResult> Update(int id, [FromForm] ResourceForm form) {
        try {
            var resource = await _context.Resources.FindAsync(id);
            if (resource is null) return NotFound();
            string? error = Validate(form);
            if (error is not null) return BadRequest(error);

            var now = DateTime.UtcNow;
            if (form.File is not null) {
                var (data, contentType, fileError) = await ReadFile(form.File);
                if (fileError is not null) return BadRequest(fileError);
                var file = await _context.ResourceFiles.FindAsync(id);
                if (file is null) {
                    file = new ResourceFile { ResourceId = id };
                    _context.ResourceFiles.Add(file);
                }
                file.Data = data!;
                SetFile(resource, form.File.FileName, contentType!, data!.Length);
            }
            Apply(resource, form, now);
            await _context.SaveChangesAsync();
            return Ok(ResourceResponse.From(resource));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id) {
        try {
            var resource = await _context.Resources.FindAsync(id);
            if (resource is null) return NotFound();
            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private static string? Validate(ResourceForm form) {
        if (form.Title.Trim().Length == 0) return "Please enter a title.";
        if (!ReferenceData.ResourceAudiences.Contains(form.Audience)) return "Unknown audience.";
        if (!ReferenceData.ResourceTopics.Contains(form.Topic)) return "Unknown topic.";
        return null;
    }

    private static void Apply(Resource resource, ResourceForm form, DateTime now) {
        resource.Title = form.Title.Trim();
        resource.Description = form.Description.Trim();
        resource.Audience = form.Audience;
        resource.Topic = form.Topic;
        resource.UpdatedAt = now;
    }

    private static void SetFile(Resource resource, string fileName, string contentType, long size) {
        resource.FileName = Path.GetFileName(fileName);
        resource.ContentType = contentType;
        resource.FileSize = size;
    }

    private static async Task<(byte[]? Data, string? ContentType, string? Error)> ReadFile(IFormFile file) {
        if (file.Length == 0) return (null, null, "Please choose a file.");
        if (file.Length > MaxFileSize) return (null, null, "The file must be 5 MB or smaller.");
        string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedTypes.TryGetValue(extension, out var contentType)) return (null, null, "Only PDF or Word (.docx) files are accepted.");
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        byte[] data = stream.ToArray();
        if (!FileSignatures.Matches(data, contentType)) return (null, null, "The file does not look like a PDF or Word document.");
        return (data, contentType, null);
    }
}
