using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Organization {
    [Key] public int Id { get; set; }
    [Required] public string OrgName { get; set; } = "";
    [Required] public string ContactName { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
    public bool IsApproved { get; set; } = false;
}
