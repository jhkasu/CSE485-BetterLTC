using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Organization {

[Key] public int Id { get; set; }

[Required] public string OrgName { get; set; } = "";

}
