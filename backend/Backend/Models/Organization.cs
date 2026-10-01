using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Organization : IAccount {
    [Key] public int Id { get; set; }
    [Required] public string OrgName { get; set; } = "";
    [Required] public string ContactName { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
    public bool IsApproved { get; set; } = false;
    public string Description { get; set; } = "";
    public List<string> ServiceAreas { get; set; } = [];
    public List<string> HelpTypes { get; set; } = [];
    public List<string> Categories { get; set; } = [];
    public string NotificationEmail { get; set; } = "";
    public string Website { get; set; } = "";
    public DateTime? LogoUpdatedAt { get; set; }

    public bool Serves(string city, string helpType) {
        return ServiceAreas.Contains(city) && HelpTypes.Contains(helpType);
    }
}
