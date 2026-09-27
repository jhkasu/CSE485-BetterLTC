namespace Backend.Models;

public record OrganizationResponse(int Id, string OrgName, string ContactName, string Email, bool IsApproved) {
    public static OrganizationResponse From(Organization o) {
        return new OrganizationResponse(o.Id, o.OrgName, o.ContactName, o.Email, o.IsApproved);
    }
}
