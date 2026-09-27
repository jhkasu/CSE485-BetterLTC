using System.Security.Claims;

namespace Backend.Security;

public static class Roles {
    public const string Admin = "admin";
    public const string Volunteer = "volunteer";
    public const string Organization = "organization";
    public const string OrganizationOrAdmin = Organization + "," + Admin;
    public const string IdClaim = "sub";
    public const string RoleClaim = "role";

    public static int? AccountId(this ClaimsPrincipal user) {
        return int.TryParse(user.FindFirst(IdClaim)?.Value, out int id) ? id : null;
    }

    public static bool IsAccount(this ClaimsPrincipal user, string role, int id) {
        return user.IsInRole(role) && user.AccountId() == id;
    }
}
