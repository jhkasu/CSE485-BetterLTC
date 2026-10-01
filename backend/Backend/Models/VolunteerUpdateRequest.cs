using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class VolunteerUpdateRequest {
    [Required] public string FirstName { get; set; } = "";
    [Required] public string LastName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
}
