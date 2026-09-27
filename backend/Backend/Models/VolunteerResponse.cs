namespace Backend.Models;

public record VolunteerResponse(int Id, string FirstName, string LastName, string Email, bool BackgroundCheckApproved) {
    public static VolunteerResponse From(Volunteer v) {
        return new VolunteerResponse(v.Id, v.FirstName, v.LastName, v.Email, v.BackgroundCheckApproved);
    }
}
