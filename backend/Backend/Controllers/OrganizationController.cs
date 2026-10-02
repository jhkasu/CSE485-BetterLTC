using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Files;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/organizations")]
[ApiController]
public class OrganizationController : ControllerBase {
    private const long MaxLogoSize = 2 * 1024 * 1024;
    private static readonly Dictionary<string, string> LogoTypes = new() {
        [".jpg"] = FileSignatures.Jpeg,
        [".jpeg"] = FileSignatures.Jpeg,
        [".png"] = FileSignatures.Png,
    };

    private readonly AppDbContext _context;

    public OrganizationController(AppDbContext context) {
        this._context = context;
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAllOrganizations() {
        try {
            var orgs = await _context.Organizations.OrderByDescending(o => o.Id).ToListAsync();
            return Ok(orgs.Select(OrganizationResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddOrganization(Organization org) {
        try {
            org.Email = AccountEmails.Normalize(org.Email);
            if (await AccountEmails.IsTaken(_context, org.Email)) return Conflict(AccountEmails.AlreadyRegistered);
            org.Password = PasswordHashing.Hash(org.Password);
            _context.Organizations.Add(org);
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetOrganization(int id) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Organization, id)) return Forbid();
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> UpdateOrganization(int id, OrganizationUpdateRequest updated) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            org.OrgName = updated.OrgName;
            org.ContactName = updated.ContactName;
            org.Email = updated.Email;
            org.IsApproved = updated.IsApproved;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/profile")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> UpdateProfile(int id, OrganizationProfileRequest profile) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Organization, id)) return Forbid();
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            var areas = profile.ServiceAreas.Distinct().ToList();
            var helpTypes = profile.HelpTypes.Distinct().ToList();
            var categories = profile.Categories.Distinct().ToList();
            if (areas.Any(a => !ReferenceData.Cities.Contains(a))) return BadRequest("Unknown service area.");
            if (helpTypes.Any(h => !ReferenceData.HelpTypes.Contains(h))) return BadRequest("Unknown help type.");
            if (categories.Any(c => !ReferenceData.OrganizationCategories.Contains(c))) return BadRequest("Unknown category.");
            string notificationEmail = AccountEmails.Normalize(profile.NotificationEmail);
            if (notificationEmail.Length > 0 && !new EmailAddressAttribute().IsValid(notificationEmail)) return BadRequest("Invalid notification email.");
            string orgName = profile.OrgName.Trim();
            if (orgName.Length == 0) return BadRequest("Organization name is required.");
            string website = profile.Website.Trim();
            if (website.Length > 0 && !IsWebsite(website)) return BadRequest("The website must be a full address starting with https://.");

            org.OrgName = orgName;
            org.Description = profile.Description.Trim();
            org.ServiceAreas = areas;
            org.HelpTypes = helpTypes;
            org.Categories = categories;
            org.OffersIntergenerational = profile.OffersIntergenerational;
            org.NotificationEmail = notificationEmail;
            org.Website = website;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("directory")]
    public async Task<IActionResult> GetDirectory([FromQuery] List<string> category, [FromQuery] List<string> area, [FromQuery] bool intergenerational = false) {
        try {
            var query = _context.Organizations.AsNoTracking().Where(o => o.IsApproved);
            if (category.Count > 0) query = query.Where(o => o.Categories.Any(c => category.Contains(c)));
            if (area.Count > 0) query = query.Where(o => o.ServiceAreas.Any(a => area.Contains(a)));
            if (intergenerational) query = query.Where(o => o.OffersIntergenerational);
            var orgs = await query.OrderBy(o => o.OrgName).ToListAsync();
            return Ok(orgs.Select(OrganizationPublicResponse.From));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}/public")]
    public async Task<IActionResult> GetPublicProfile(int id) {
        try {
            var org = await _context.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id && o.IsApproved);
            if (org is null) return NotFound();
            return Ok(OrganizationPublicResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id:int}/logo")]
    public async Task<IActionResult> GetLogo(int id) {
        try {
            bool visible = await _context.Organizations.AnyAsync(o => o.Id == id && o.IsApproved)
                || User.IsInRole(Roles.Admin)
                || User.IsAccount(Roles.Organization, id);
            if (!visible) return NotFound();
            var logo = await _context.OrganizationLogos.AsNoTracking().FirstOrDefaultAsync(l => l.OrganizationId == id);
            if (logo is null) return NotFound();
            Response.Headers.CacheControl = "public, max-age=86400";
            return File(logo.Data, logo.ContentType);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/logo")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    [RequestSizeLimit(MaxLogoSize + 1024 * 1024)]
    public async Task<IActionResult> UploadLogo(int id, IFormFile file) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Organization, id)) return Forbid();
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            if (file is null || file.Length == 0) return BadRequest("Please choose an image.");
            if (file.Length > MaxLogoSize) return BadRequest("The image must be 2 MB or smaller.");
            string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!LogoTypes.TryGetValue(extension, out var contentType)) return BadRequest("Only JPG or PNG images are accepted.");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            byte[] data = stream.ToArray();
            if (!FileSignatures.Matches(data, contentType)) return BadRequest("The file does not look like a JPG or PNG image.");

            var logo = await _context.OrganizationLogos.FindAsync(id);
            if (logo is null) {
                logo = new OrganizationLogo { OrganizationId = id };
                _context.OrganizationLogos.Add(logo);
            }
            logo.ContentType = contentType;
            logo.Data = data;
            org.LogoUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}/logo")]
    [Authorize(Roles = Roles.OrganizationOrAdmin)]
    public async Task<IActionResult> DeleteLogo(int id) {
        try {
            if (!User.IsInRole(Roles.Admin) && !User.IsAccount(Roles.Organization, id)) return Forbid();
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            await _context.OrganizationLogos.Where(l => l.OrganizationId == id).ExecuteDeleteAsync();
            org.LogoUpdatedAt = null;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/approve")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> ApproveOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            org.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/revoke")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> RevokeOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            org.IsApproved = false;
            await _context.SaveChangesAsync();
            return Ok(OrganizationResponse.From(org));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeleteOrganization(int id) {
        try {
            var org = await _context.Organizations.FindAsync(id);
            if (org is null) return NotFound();
            _context.Organizations.Remove(org);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private static bool IsWebsite(string value) {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && uri.Host.Contains('.');
    }
}
