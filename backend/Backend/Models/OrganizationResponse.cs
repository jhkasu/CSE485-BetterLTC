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
    List<string> Categories,
    bool OffersIntergenerational,
    string NotificationEmail,
    string Website,
    long? LogoVersion) {
    public static OrganizationResponse From(Organization o) {
        return new OrganizationResponse(
            o.Id, o.OrgName, o.ContactName, o.Email, o.IsApproved,
            o.Description, o.ServiceAreas, o.HelpTypes, o.Categories, o.OffersIntergenerational, o.NotificationEmail,
            o.Website, OrganizationLogoVersion.For(o));
    }
}

public record OrganizationPublicResponse(
    int Id,
    string OrgName,
    string Description,
    List<string> ServiceAreas,
    List<string> HelpTypes,
    List<string> Categories,
    bool OffersIntergenerational,
    string Website,
    long? LogoVersion) {
    public static OrganizationPublicResponse From(Organization o) {
        return new OrganizationPublicResponse(
            o.Id, o.OrgName, o.Description, o.ServiceAreas, o.HelpTypes, o.Categories, o.OffersIntergenerational,
            o.Website, OrganizationLogoVersion.For(o));
    }
}

public static class OrganizationLogoVersion {
    public static long? For(Organization o) {
        return o.LogoUpdatedAt is DateTime updated ? new DateTimeOffset(DateTime.SpecifyKind(updated, DateTimeKind.Utc)).ToUnixTimeMilliseconds() : null;
    }
}
