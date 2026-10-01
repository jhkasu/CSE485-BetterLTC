using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class OrganizationProfileRequest {
    [Required, MaxLength(200)] public string OrgName { get; set; } = "";
    [MaxLength(500)] public string Description { get; set; } = "";
    public List<string> ServiceAreas { get; set; } = [];
    public List<string> HelpTypes { get; set; } = [];
    [MaxLength(200)] public string NotificationEmail { get; set; } = "";
}
