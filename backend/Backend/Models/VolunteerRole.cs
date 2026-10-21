using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class VolunteerRole {
    [Key] public int Id { get; set; }
    public int OrganizationId { get; set; }
    [Required] public string Title { get; set; } = "";
    public string TimeCommitment { get; set; } = "";
    public string Description { get; set; } = "";
}

public class VolunteerRoleRequest {
    [Required, MaxLength(100)] public string Title { get; set; } = "";
    [MaxLength(100)] public string TimeCommitment { get; set; } = "";
    [MaxLength(500)] public string Description { get; set; } = "";
}

public record VolunteerRoleResponse(int Id, string Title, string TimeCommitment, string Description) {
    public static VolunteerRoleResponse From(VolunteerRole r) {
        return new VolunteerRoleResponse(r.Id, r.Title, r.TimeCommitment, r.Description);
    }
}
