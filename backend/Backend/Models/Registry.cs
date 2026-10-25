using System.Text.RegularExpressions;

namespace Backend.Models;

public static class Registry {
    public const string Charity = "Charity";
    public const string Nonprofit = "Nonprofit";

    private static readonly Regex CharityNumber = new(@"^\d{9}RR\d{4}$");
    private static readonly Regex NonprofitNumber = new(@"^\d{6,10}$");

    public static string Normalize(string? number) {
        return Regex.Replace(number ?? "", @"[\s\-]", "").ToUpperInvariant();
    }

    public static bool IsValid(string type, string normalizedNumber) {
        return type switch {
            Charity => CharityNumber.IsMatch(normalizedNumber),
            Nonprofit => NonprofitNumber.IsMatch(normalizedNumber),
            _ => false,
        };
    }

    public static string? Validate(string type, string normalizedNumber) {
        if (type != Charity && type != Nonprofit) return "Choose a registration type.";
        if (!IsValid(type, normalizedNumber)) {
            return type == Charity
                ? "A charity registration number looks like 123456789RR0001."
                : "A corporation number has 6 to 10 digits.";
        }
        return null;
    }
}
