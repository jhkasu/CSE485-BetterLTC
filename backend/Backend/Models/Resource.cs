using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Resource {
    [Key] public int Id { get; set; }
    [Required] public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    [Required] public string Audience { get; set; } = "";
    [Required] public string Topic { get; set; } = "";
    public string FileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long FileSize { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ResourceFile {
    [Key] public int ResourceId { get; set; }
    public byte[] Data { get; set; } = [];
}

public record ResourceResponse(
    int Id,
    string Title,
    string Description,
    string Audience,
    string Topic,
    string FileName,
    string FileType,
    long FileSize,
    DateTime UpdatedAt) {
    public static ResourceResponse From(Resource r) {
        return new ResourceResponse(
            r.Id, r.Title, r.Description, r.Audience, r.Topic, r.FileName,
            Path.GetExtension(r.FileName).TrimStart('.').ToUpperInvariant(), r.FileSize, r.UpdatedAt);
    }
}

public class ResourceForm {
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(500)] public string Description { get; set; } = "";
    [Required] public string Audience { get; set; } = "";
    [Required] public string Topic { get; set; } = "";
    public IFormFile? File { get; set; }
}
