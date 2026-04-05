using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Listing {

[Key] public int Id { get; set; }

[Required] public string ListingTitle { get; set; } = "";
[Required] public string ListingDate { get; set; } = "";
[Required] public string StartDate { get; set; } = "";
[Required] public string EndDate { get; set; } = "";
[Required] public string OrgName { get; set; } = "";
[Required] public string Status { get; set; } = "";

}
