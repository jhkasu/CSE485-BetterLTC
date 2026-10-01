namespace Backend.Models;

public record OrganizationResponse(
    int Id,
    string OrgName,
    string ContactName,
    string Email,
    bool IsApproved,
    string Description,
    List<string> ServiceAreas,
    List<string> HelpTypes,
    string NotificationEmail) {
    public static OrganizationResponse From(Organization o) {
        return new OrganizationResponse(
            o.Id, o.OrgName, o.ContactName, o.Email, o.IsApproved,
            o.Description, o.ServiceAreas, o.HelpTypes, o.NotificationEmail);
    }
}
