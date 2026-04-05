using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Volunteer {

[Key] public int Id { get; set; }
    
    [Required] public string FirstName { get; set; } = "";
    [Required] public string LastName  { get; set; } = "";
    [Required] public string Email     { get; set; } = "";
    [Required] public string Password  { get; set; } = "";
}
