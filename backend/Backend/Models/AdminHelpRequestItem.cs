namespace Backend.Models;

public record AdminHelpRequestItem(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string ContactMethod,
    string HelpType,
    string City,
    bool ForFamilyMember,
    string SeniorName,
    string Language,
    string Status,
    DateTime SubmittedAt,
    DateTime? AcceptedAt,
    DateTime? ContactedAt,
    int? OrganizationId,
    string OrganizationName,
    string Alert);

public static class HelpRequestAlerts {
    public const string NoOrganization = "NoOrganization";
    public const string NotContacted = "NotContacted";
    public static readonly TimeSpan NoOrganizationAfter = TimeSpan.FromDays(3);
    public static readonly TimeSpan NotContactedAfter = TimeSpan.FromDays(2);

    public static string For(HelpRequest r, DateTime now) {
        if (r.Status == HelpRequestStatuses.New && now - r.SubmittedAt > NoOrganizationAfter) return NoOrganization;
        if (r.Status == HelpRequestStatuses.Accepted && r.AcceptedAt is not null && now - r.AcceptedAt > NotContactedAfter) return NotContacted;
        return "";
    }
}
