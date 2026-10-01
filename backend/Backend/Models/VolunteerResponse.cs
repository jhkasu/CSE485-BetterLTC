namespace Backend.Models;

public record VolunteerResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address,
    string City,
    List<string> AvailableDays,
    List<string> AvailableTimes,
    List<string> Interests,
    List<string> Languages) {
    public static VolunteerResponse From(Volunteer v) {
        return new VolunteerResponse(
            v.Id, v.FirstName, v.LastName, v.Email, v.Phone, v.Address,
            v.City, v.AvailableDays, v.AvailableTimes, v.Interests, v.Languages);
    }
}
