namespace Backend.Models;

public record OpenHelpRequestResponse(
    int Id,
    string HelpType,
    string City,
    string ContactMethod,
    bool ForFamilyMember,
    DateTime SubmittedAt) {
    public static OpenHelpRequestResponse From(HelpRequest r) {
        return new OpenHelpRequestResponse(r.Id, r.HelpType, r.City, r.ContactMethod, r.ForFamilyMember, r.SubmittedAt);
    }
}

public record HelpRequestDetailResponse(
    int Id,
    string HelpType,
    string City,
    string ContactMethod,
    string FirstName,
    string LastName,
    string Phone,
    string Email,
    bool ForFamilyMember,
    string SeniorName,
    string Status,
    DateTime SubmittedAt,
    DateTime? AcceptedAt,
    DateTime? ContactedAt) {
    public static HelpRequestDetailResponse From(HelpRequest r) {
        return new HelpRequestDetailResponse(
            r.Id, r.HelpType, r.City, r.ContactMethod, r.FirstName, r.LastName, r.Phone, r.Email,
            r.ForFamilyMember, r.SeniorName, r.Status, r.SubmittedAt, r.AcceptedAt, r.ContactedAt);
    }
}
