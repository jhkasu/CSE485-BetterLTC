using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class OrganizationLogo {
    [Key] public int OrganizationId { get; set; }
    public string ContentType { get; set; } = "";
    public byte[] Data { get; set; } = [];
}
