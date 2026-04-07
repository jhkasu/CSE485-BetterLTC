using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers;

[Route("api/listings")]
[ApiController]
public class ListingsController : ControllerBase {
    private readonly ListingsDbContext _context;

    public ListingsController(ListingsDbContext context) {
        this._context = context;
    }

[HttpPost]
public async Task<IActionResult> AddListing(Listing listing) {
    try {
        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();
        return Ok(listing);
    } catch (Exception ex) {
        return StatusCode(500, ex.Message);
    }
}

[HttpGet("{id:int}")]
public async Task<IActionResult> GetListing(int id) {
    try {
        var listing = await _context.Listings.FindAsync(id);
        if (listing is null) {
            return NotFound();
        }
        return Ok(listing);
    } catch (Exception ex) {
        return StatusCode(500, ex.Message);
    }
}

[HttpDelete("{id:int}")]
public async Task<IActionResult> DeleteListing(int id) {
    try {
        var listing = await _context.Listings.FindAsync(id);
        if (listing is null) {
            return NotFound();
        }
        _context.Listings.Remove(listing);
        await _context.SaveChangesAsync();
        return NoContent();
    } catch (Exception ex) {
        return StatusCode(500, ex.Message);
    }
}

} //ListingsController
