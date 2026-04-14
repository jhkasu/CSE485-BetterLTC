using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class HelpRequest {
    [Key] public int Id { get; set; }
    [Required] public string FirstName { get; set; } = "";
    [Required] public string LastName { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    [Required] public string HelpType { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
