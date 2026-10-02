using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Security;

namespace Backend.Controllers;

[Route("api/statistics")]
[ApiController]
public class StatisticsController : ControllerBase {
    public static readonly HashSet<string> TrackedPaths = [
        "/", "/get-help", "/about", "/about/mission", "/about/history", "/about/team",
        "/our-work", "/organizations", "/resources", "/faq", "/intergenerational", "/signup", "/signin",
    ];
    public static readonly int[] AllowedRanges = [7, 30, 90];
    private static readonly Regex OrganizationPath = new(@"^/organizations/(\d{1,9})$");
    private static readonly string[] BotMarkers = ["bot", "crawler", "spider", "headless", "preview"];

    private readonly AppDbContext _context;

    public StatisticsController(AppDbContext context) {
        _context = context;
    }

    public static string? NormalizePath(string? path) {
        if (string.IsNullOrWhiteSpace(path)) return null;
        string clean = path.Split('?', '#')[0].Trim().ToLowerInvariant();
        if (clean.Length > 1) clean = clean.TrimEnd('/');
        if (TrackedPaths.Contains(clean)) return clean;
        return OrganizationPath.IsMatch(clean) ? clean : null;
    }

    public static bool IsBot(string? userAgent) {
        if (string.IsNullOrWhiteSpace(userAgent)) return true;
        string agent = userAgent.ToLowerInvariant();
        return BotMarkers.Any(agent.Contains);
    }

    private static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

    [HttpPost("views")]
    public async Task<IActionResult> RecordView(PageViewRequest request) {
        try {
            string? path = NormalizePath(request.Path);
            if (path is null || IsBot(Request.Headers.UserAgent)) return NoContent();
            var today = Today;
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO ""PageViewDailies"" (""Date"", ""Path"", ""Count"") VALUES ({today}, {path}, 1)
                ON CONFLICT (""Date"", ""Path"") DO UPDATE SET ""Count"" = ""PageViewDailies"".""Count"" + 1");
            return NoContent();
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }

    public static async Task RecordDownload(AppDbContext context, int resourceId, string? userAgent) {
        if (IsBot(userAgent)) return;
        var today = Today;
        await context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO ""ResourceDownloadDailies"" (""Date"", ""ResourceId"", ""Count"") VALUES ({today}, {resourceId}, 1)
            ON CONFLICT (""Date"", ""ResourceId"") DO UPDATE SET ""Count"" = ""ResourceDownloadDailies"".""Count"" + 1");
    }

    [HttpGet("summary")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Summary([FromQuery] int days = 30) {
        try {
            if (!AllowedRanges.Contains(days)) return BadRequest("Days must be 7, 30, or 90.");
            var to = Today;
            var from = to.AddDays(-(days - 1));

            var views = await _context.PageViewDailies.AsNoTracking()
                .Where(v => v.Date >= from && v.Date <= to)
                .ToListAsync();
            var downloads = await _context.ResourceDownloadDailies.AsNoTracking()
                .Where(d => d.Date >= from && d.Date <= to)
                .ToListAsync();

            var byDate = views.GroupBy(v => v.Date).ToDictionary(g => g.Key, g => g.Sum(v => v.Count));
            var daily = Enumerable.Range(0, days)
                .Select(i => from.AddDays(i))
                .Select(date => new DailyCount(date, byDate.GetValueOrDefault(date)))
                .ToList();

            var topPages = views
                .Where(v => !OrganizationPath.IsMatch(v.Path))
                .GroupBy(v => v.Path)
                .Select(g => new PathCount(g.Key, g.Sum(v => v.Count)))
                .OrderByDescending(p => p.Count).ThenBy(p => p.Path)
                .Take(10)
                .ToList();

            var orgCounts = views
                .Select(v => (Match: OrganizationPath.Match(v.Path), v.Count))
                .Where(x => x.Match.Success)
                .GroupBy(x => int.Parse(x.Match.Groups[1].Value))
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Count));
            var orgNames = await _context.Organizations.AsNoTracking()
                .Where(o => orgCounts.Keys.Contains(o.Id))
                .ToDictionaryAsync(o => o.Id, o => o.OrgName);
            var topOrganizations = orgCounts
                .Where(kv => orgNames.ContainsKey(kv.Key))
                .Select(kv => new NamedCount(kv.Key, orgNames[kv.Key], kv.Value))
                .OrderByDescending(o => o.Count).ThenBy(o => o.Name)
                .Take(5)
                .ToList();

            var downloadCounts = downloads.GroupBy(d => d.ResourceId).ToDictionary(g => g.Key, g => g.Sum(d => d.Count));
            var resourceTitles = await _context.Resources.AsNoTracking()
                .Where(r => downloadCounts.Keys.Contains(r.Id))
                .ToDictionaryAsync(r => r.Id, r => r.Title);
            var topResources = downloadCounts
                .Where(kv => resourceTitles.ContainsKey(kv.Key))
                .Select(kv => new NamedCount(kv.Key, resourceTitles[kv.Key], kv.Value))
                .OrderByDescending(r => r.Count).ThenBy(r => r.Name)
                .Take(5)
                .ToList();

            return Ok(new StatisticsSummary(
                days,
                views.Sum(v => v.Count),
                downloads.Sum(d => d.Count),
                daily,
                topPages,
                topOrganizations,
                topResources));
        } catch (Exception ex) {
            return StatusCode(500, ex.Message);
        }
    }
}
