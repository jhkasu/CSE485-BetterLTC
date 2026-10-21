using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class OrganizationSignupRequest {
    [Required, MaxLength(200)] public string OrgName { get; set; } = "";
    [Required, MaxLength(200)] public string ContactName { get; set; } = "";
    [Required, MaxLength(200)] public string Email { get; set; } = "";
    [Required, MinLength(8), MaxLength(200)] public string Password { get; set; } = "";
    [MaxLength(20)] public string RegistryType { get; set; } = "";
    [MaxLength(40)] public string RegistryNumber { get; set; } = "";
}

public class OrganizationRegistryRequest {
    [MaxLength(20)] public string RegistryType { get; set; } = "";
    [MaxLength(40)] public string RegistryNumber { get; set; } = "";
}

public class OrganizationRejectRequest {
    [Required, MaxLength(500)] public string Reason { get; set; } = "";
}
