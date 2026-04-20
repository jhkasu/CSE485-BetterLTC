using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Listing {
    [Key] public int Id { get; set; }
    [Required] public string ListingTitle { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
    public string Days { get; set; } = "";
    [Required] public string OrgName { get; set; } = "";
    [Required] public string Status { get; set; } = "";
    public string ListingDate { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public string Category { get; set; } = "";
}
