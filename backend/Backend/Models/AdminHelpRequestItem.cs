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
    string OrganizationName);
