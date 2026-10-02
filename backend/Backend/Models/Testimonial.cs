using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Testimonial {
    [Key] public int Id { get; set; }
    [Required] public string QuoteEn { get; set; } = "";
    public string QuoteFr { get; set; } = "";
    [Required] public string Name { get; set; } = "";
    [Required] public string Role { get; set; } = "";
    public string City { get; set; } = "";
    public bool IsVisible { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? PhotoUpdatedAt { get; set; }
}

public class TestimonialPhoto {
    [Key] public int TestimonialId { get; set; }
    public string ContentType { get; set; } = "";
    public byte[] Data { get; set; } = [];
}

public class TestimonialRequest {
    [Required, MaxLength(500)] public string QuoteEn { get; set; } = "";
    [MaxLength(500)] public string QuoteFr { get; set; } = "";
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [Required] public string Role { get; set; } = "";
    [MaxLength(100)] public string City { get; set; } = "";
    public bool IsVisible { get; set; } = true;
}

public record TestimonialResponse(
    int Id,
    string QuoteEn,
    string QuoteFr,
    string Name,
    string Role,
    string City,
    bool IsVisible,
    long? PhotoVersion) {
    public static TestimonialResponse From(Testimonial t) {
        long? version = t.PhotoUpdatedAt is DateTime updated
            ? new DateTimeOffset(DateTime.SpecifyKind(updated, DateTimeKind.Utc)).ToUnixTimeMilliseconds()
            : null;
        return new TestimonialResponse(t.Id, t.QuoteEn, t.QuoteFr, t.Name, t.Role, t.City, t.IsVisible, version);
    }
}
