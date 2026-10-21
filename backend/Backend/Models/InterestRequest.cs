using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class InterestRequest {
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [Required, MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(30)] public string Phone { get; set; } = "";
    public int? RoleId { get; set; }
    [MaxLength(1000)] public string Message { get; set; } = "";
    public bool ConsentGiven { get; set; }
    [MaxLength(10)] public string Language { get; set; } = "en";
    [MaxLength(200)] public string Website { get; set; } = "";
}
