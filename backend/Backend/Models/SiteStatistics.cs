using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class PageViewDaily {
    [Key] public int Id { get; set; }
    public DateOnly Date { get; set; }
    [Required] public string Path { get; set; } = "";
    public int Count { get; set; }
}

public class ResourceDownloadDaily {
    [Key] public int Id { get; set; }
    public DateOnly Date { get; set; }
    public int ResourceId { get; set; }
    public int Count { get; set; }
}

public class PageViewRequest {
    public string Path { get; set; } = "";
}

public record DailyCount(DateOnly Date, int Count);

public record PathCount(string Path, int Count);

public record NamedCount(int Id, string Name, int Count);

public record StatisticsSummary(
    int Days,
    int TotalViews,
    int TotalDownloads,
    List<DailyCount> Daily,
    List<PathCount> TopPages,
    List<NamedCount> TopOrganizations,
    List<NamedCount> TopResources);
