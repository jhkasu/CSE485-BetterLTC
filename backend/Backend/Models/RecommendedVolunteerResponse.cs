using Backend.Matching;

namespace Backend.Models;

public record RecommendedVolunteerResponse(
    int Id,
    string FirstName,
    string LastName,
    string City,
    List<string> AvailableDays,
    List<string> AvailableTimes,
    List<string> Languages,
    MatchResult Match);
