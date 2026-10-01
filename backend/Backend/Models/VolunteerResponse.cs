namespace Backend.Models;

public record VolunteerResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address,
    bool BackgroundCheckApproved,
    string City,
    List<string> AvailableDays,
    List<string> AvailableTimes,
    List<string> Interests,
    List<string> Languages,
    bool RecommendationConsent) {
    public static VolunteerResponse From(Volunteer v) {
        return new VolunteerResponse(
            v.Id, v.FirstName, v.LastName, v.Email, v.Phone, v.Address, v.BackgroundCheckApproved,
            v.City, v.AvailableDays, v.AvailableTimes, v.Interests, v.Languages, v.RecommendationConsent);
    }
}
