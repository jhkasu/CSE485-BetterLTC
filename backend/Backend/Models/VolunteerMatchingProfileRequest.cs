namespace Backend.Models;

public class VolunteerMatchingProfileRequest {
    public string City { get; set; } = "";
    public List<string> AvailableDays { get; set; } = [];
    public List<string> AvailableTimes { get; set; } = [];
    public List<string> Interests { get; set; } = [];
    public List<string> Languages { get; set; } = [];
    public bool RecommendationConsent { get; set; }
}
