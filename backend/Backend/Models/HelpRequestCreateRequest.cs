using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class HelpRequestCreateRequest {
    [Required, MaxLength(100)] public string FirstName { get; set; } = "";
    [Required, MaxLength(100)] public string LastName { get; set; } = "";
    [MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(30)] public string Phone { get; set; } = "";
    [Required, MaxLength(100)] public string HelpType { get; set; } = "";
    [Required, MaxLength(100)] public string City { get; set; } = "";
    [Required] public string ContactMethod { get; set; } = "";
    public bool ForFamilyMember { get; set; }
    [MaxLength(200)] public string SeniorName { get; set; } = "";
    public bool ConsentGiven { get; set; }
    [MaxLength(10)] public string Language { get; set; } = "en";
}
