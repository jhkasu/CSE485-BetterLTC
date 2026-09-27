using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class OrganizationUpdateRequest {
    [Required] public string OrgName { get; set; } = "";
    [Required] public string ContactName { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    public bool IsApproved { get; set; } = false;
}
