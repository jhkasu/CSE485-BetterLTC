using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Volunteer : IAccount {

[Key] public int Id { get; set; }
    
    [Required] public string FirstName { get; set; } = "";
    [Required] public string LastName  { get; set; } = "";
    [Required] public string Email     { get; set; } = "";
    [Required] public string Password  { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public bool BackgroundCheckApproved { get; set; } = false;
}
