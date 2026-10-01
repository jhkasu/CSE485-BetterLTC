using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Admin {
    [Key] public int Id { get; set; }

    [Required] public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
}
