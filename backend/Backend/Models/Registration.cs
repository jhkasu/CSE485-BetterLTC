using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Registration {
    [Key] public int Id { get; set; }
    public int VolunteerId { get; set; }
    public string VolunteerName { get; set; } = "";
    public string VolunteerEmail { get; set; } = "";
    public int ListingId { get; set; }
    public string ListingTitle { get; set; } = "";
    public string OrgName { get; set; } = "";
    public string RegisteredAt { get; set; } = "";
    public string Status { get; set; } = "Pending";
}
