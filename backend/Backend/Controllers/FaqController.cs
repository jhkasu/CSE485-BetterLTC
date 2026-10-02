using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/faqs")]
[ApiController]
public class FaqController : ControllerBase {
    private readonly AppDbContext _context;

    public FaqController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        try {
            var items = await _context.FaqItems.AsNoTracking().ToListAsync();
            return Ok(Ordered(items));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(FaqItemRequest request) {
        try {
            string? error = Validate(request);
            if (error is not null) return BadRequest(error);
            int last = await _context.FaqItems.Where(f => f.Topic == request.Topic).Select(f => (int?)f.SortOrder).MaxAsync() ?? 0;
            var item = new FaqItem { SortOrder = last + 1 };
            Apply(item, request);
            _context.FaqItems.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, FaqItemRequest request) {
        try {
            var item = await _context.FaqItems.FindAsync(id);
            if (item is null) return NotFound();
            string? error = Validate(request);
            if (error is not null) return BadRequest(error);
            if (item.Topic != request.Topic) {
                int last = await _context.FaqItems.Where(f => f.Topic == request.Topic).Select(f => (int?)f.SortOrder).MaxAsync() ?? 0;
                item.SortOrder = last + 1;
            }
            Apply(item, request);
            await _context.SaveChangesAsync();
            return Ok(item);
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id:int}/move")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Move(int id, FaqMoveRequest request) {
        try {
            var item = await _context.FaqItems.FindAsync(id);
            if (item is null) return NotFound();
            if (request.Direction != "up" && request.Direction != "down") return BadRequest("Direction must be up or down.");
            var siblings = await _context.FaqItems.Where(f => f.Topic == item.Topic).OrderBy(f => f.SortOrder).ThenBy(f => f.Id).ToListAsync();
            int index = siblings.FindIndex(f => f.Id == id);
            int target = request.Direction == "up" ? index - 1 : index + 1;
            if (target >= 0 && target < siblings.Count) {
                (siblings[index], siblings[target]) = (siblings[target], siblings[index]);
                for (int i = 0; i < siblings.Count; i++) siblings[i].SortOrder = i + 1;
                await _context.SaveChangesAsync();
            }
            var all = await _context.FaqItems.AsNoTracking().ToListAsync();
            return Ok(Ordered(all));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id) {
        try {
            var item = await _context.FaqItems.FindAsync(id);
            if (item is null) return NotFound();
            _context.FaqItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    private static IEnumerable<FaqItem> Ordered(IEnumerable<FaqItem> items) {
        return items
            .OrderBy(f => Array.IndexOf(ReferenceData.FaqTopics, f.Topic))
            .ThenBy(f => f.SortOrder)
            .ThenBy(f => f.Id);
    }

    private static string? Validate(FaqItemRequest request) {
        if (!ReferenceData.FaqTopics.Contains(request.Topic)) return "Unknown topic.";
        if (request.QuestionEn.Trim().Length == 0 || request.AnswerEn.Trim().Length == 0) return "Please enter the English question and answer.";
        return null;
    }

    private static void Apply(FaqItem item, FaqItemRequest request) {
        item.Topic = request.Topic;
        item.QuestionEn = request.QuestionEn.Trim();
        item.AnswerEn = request.AnswerEn.Trim();
        item.QuestionFr = request.QuestionFr.Trim();
        item.AnswerFr = request.AnswerFr.Trim();
        item.UpdatedAt = DateTime.UtcNow;
    }
}
