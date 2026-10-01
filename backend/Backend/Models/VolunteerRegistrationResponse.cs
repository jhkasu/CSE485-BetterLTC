namespace Backend.Models;

public record VolunteerRegistrationResponse(
    int Id,
    int ListingId,
    string ListingTitle,
    string OrgName,
    string RegisteredAt,
    string Status,
    double? HoursServed,
    string CompletedAt,
    string Location,
    string Days,
    string StartDate,
    string EndDate);
