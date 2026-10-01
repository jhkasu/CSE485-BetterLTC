using Backend.Models;

namespace Backend.Matching;

public record MatchResult(
    int Score,
    bool SameCity,
    bool InterestMatch,
    List<string> MatchingDays,
    List<string> SharedLanguages);

public static class MatchScoring {
    public const int RequestCityWeight = 50;
    public const int RequestInterestWeight = 30;
    public const int RequestLanguageWeight = 20;

    public const int ListingCityWeight = 45;
    public const int ListingDaysWeight = 35;
    public const int ListingInterestWeight = 20;

    public static MatchResult ForRequest(Volunteer volunteer, HelpRequest request) {
        bool sameCity = volunteer.City == request.City;
        bool interest = volunteer.Interests.Contains(request.HelpType);
        string language = LanguageName(request.Language);
        var shared = volunteer.Languages.Contains(language) ? new List<string> { language } : [];
        int score = (sameCity ? RequestCityWeight : 0)
            + (interest ? RequestInterestWeight : 0)
            + (shared.Count > 0 ? RequestLanguageWeight : 0);
        return new MatchResult(score, sameCity, interest, [], shared);
    }

    public static MatchResult ForListing(Volunteer volunteer, Listing listing) {
        bool sameCity = volunteer.City == listing.Location;
        bool interest = volunteer.Interests.Contains(listing.Category);
        var listingDays = listing.Days.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var matchingDays = listingDays.Length == 0
            ? volunteer.AvailableDays.ToList()
            : listingDays.Where(volunteer.AvailableDays.Contains).ToList();
        double dayShare = listingDays.Length == 0
            ? (volunteer.AvailableDays.Count > 0 ? 1 : 0)
            : (double)matchingDays.Count / listingDays.Length;
        int score = (sameCity ? ListingCityWeight : 0)
            + (int)Math.Round(dayShare * ListingDaysWeight)
            + (interest ? ListingInterestWeight : 0);
        return new MatchResult(score, sameCity, interest, matchingDays, []);
    }

    public static string LanguageName(string code) {
        return code.StartsWith("fr", StringComparison.OrdinalIgnoreCase) ? "French" : "English";
    }
}
