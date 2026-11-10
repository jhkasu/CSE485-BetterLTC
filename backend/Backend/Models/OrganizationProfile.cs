using System.ComponentModel.DataAnnotations;
using Backend.Security;

namespace Backend.Models;

public static class OrganizationProfile {
    public const int ShortDescriptionMinWords = 50;
    public const int ShortDescriptionMaxWords = 100;

    public static int CountWords(string text) {
        return text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    public static bool IsWebsite(string value) {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps && uri.Host.Contains('.');
    }

    public static string? Validate(OrganizationProfileRequest r) {
        if (r.LegalName.Trim().Length == 0) return "The legal name of the organization is required.";
        if (!ReferenceData.OrganizationTypes.Contains(r.OrgType)) return "Choose an organization type.";
        if (r.OrgType == "Other" && r.OrgTypeOther.Trim().Length == 0) return "Describe the organization type.";
        if (r.YearEstablished is int year && (year < 1800 || year > DateTime.UtcNow.Year)) return "Enter a valid year established.";
        if (r.GeographicScope.Count == 0) return "Choose the geographic area served.";
        if (r.GeographicScope.Any(g => !ReferenceData.GeographicScopes.Contains(g))) return "Unknown geographic area.";
        if (r.ServiceAreas.Any(a => !ReferenceData.Cities.Contains(a))) return "Unknown service area.";
        if (r.StreetAddress.Trim().Length == 0 || r.City.Trim().Length == 0 || r.Province.Trim().Length == 0 || r.PostalCode.Trim().Length == 0) {
            return "The full primary address is required.";
        }
        if (!IsWebsite(r.Website.Trim())) return "The website must be a full address starting with https://.";
        foreach (string link in new[] { r.Facebook, r.Instagram, r.LinkedIn, r.YouTube, r.TikTok, r.OtherSocial }) {
            if (link.Trim().Length > 0 && !IsWebsite(link.Trim())) return "Social media links must be full addresses starting with https://.";
        }
        int words = CountWords(r.ShortDescription);
        if (words < ShortDescriptionMinWords || words > ShortDescriptionMaxWords) return "The short description must be 50 to 100 words.";
        if (r.Categories.Count == 0) return "Choose at least one area of focus.";
        if (r.Categories.Any(c => !ReferenceData.OrganizationCategories.Contains(c))) return "Unknown area of focus.";
        if (r.Categories.Contains("Other") && r.CategoryOther.Trim().Length == 0) return "Describe the other area of focus.";
        if (r.PopulationsServed.Count == 0) return "Choose who the organization serves.";
        if (r.PopulationsServed.Any(p => !ReferenceData.PopulationsServed.Contains(p))) return "Unknown population served.";
        if (r.PopulationsServed.Contains("Other") && r.PopulationOther.Trim().Length == 0) return "Describe the other population served.";
        if (r.ServiceLanguages.Any(l => !ReferenceData.ServiceLanguages.Contains(l))) return "Unknown service language.";
        if (r.ContactName.Trim().Length == 0) return "The name of the person submitting this form is required.";
        string notificationEmail = AccountEmails.Normalize(r.NotificationEmail);
        if (notificationEmail.Length > 0 && !new EmailAddressAttribute().IsValid(notificationEmail)) return "Invalid notification email.";
        if (r.UpdateContact.Length > 0 && !ReferenceData.UpdateContacts.Contains(r.UpdateContact)) return "Unknown update contact.";
        if (r.ReviewFrequency.Length > 0 && !ReferenceData.ReviewFrequencies.Contains(r.ReviewFrequency)) return "Unknown review frequency.";
        if (r.EngagementInterests.Any(e => !ReferenceData.EngagementInterests.Contains(e))) return "Unknown engagement opportunity.";
        if (!(r.ConfirmAuthorized && r.ConfirmAccurate && r.ConfirmPublication && r.ConfirmMedia && r.ConfirmUpdates)) {
            return "All authorization and consent boxes must be checked.";
        }
        if (r.RepresentativeName.Trim().Length == 0) return "The name of the authorized representative is required.";
        return null;
    }

    public static void Apply(OrganizationProfileRequest r, Organization org) {
        string legalName = r.LegalName.Trim();
        string publicName = r.OrgName.Trim();
        org.LegalName = legalName;
        org.OrgName = publicName.Length > 0 ? publicName : legalName;
        org.OrgType = r.OrgType;
        org.OrgTypeOther = r.OrgType == "Other" ? r.OrgTypeOther.Trim() : "";
        org.YearEstablished = r.YearEstablished;
        org.GeographicScope = r.GeographicScope.Distinct().ToList();
        org.CommunitiesServed = r.CommunitiesServed.Trim();
        org.ServiceAreas = r.ServiceAreas.Distinct().ToList();
        org.StreetAddress = r.StreetAddress.Trim();
        org.City = r.City.Trim();
        org.Province = r.Province.Trim();
        org.PostalCode = r.PostalCode.Trim().ToUpperInvariant();
        org.AdditionalLocations = r.AdditionalLocations.Trim();
        org.Website = r.Website.Trim();
        org.Facebook = r.Facebook.Trim();
        org.Instagram = r.Instagram.Trim();
        org.LinkedIn = r.LinkedIn.Trim();
        org.YouTube = r.YouTube.Trim();
        org.TikTok = r.TikTok.Trim();
        org.OtherSocial = r.OtherSocial.Trim();

        org.Tagline = r.Tagline.Trim();
        org.ShortDescription = r.ShortDescription.Trim();
        org.Description = r.Description.Trim();
        org.Mission = r.Mission.Trim();
        org.Vision = r.Vision.Trim();
        org.CoreValues = r.CoreValues.Trim();
        org.Story = r.Story.Trim();
        org.Uniqueness = r.Uniqueness.Trim();
        org.Goals = r.Goals.Trim();

        org.Categories = r.Categories.Distinct().ToList();
        org.CategoryOther = org.Categories.Contains("Other") ? r.CategoryOther.Trim() : "";
        org.PopulationsServed = r.PopulationsServed.Distinct().ToList();
        org.PopulationOther = org.PopulationsServed.Contains("Other") ? r.PopulationOther.Trim() : "";
        org.ServiceLanguages = r.ServiceLanguages.Distinct().ToList();
        org.ServiceLanguageOther = org.ServiceLanguages.Contains("Other") ? r.ServiceLanguageOther.Trim() : "";
        org.LanguageServices = org.ServiceLanguages.Count > 0 ? r.LanguageServices.Trim() : "";
        org.OffersIntergenerational = r.OffersIntergenerational;

        org.ContactName = r.ContactName.Trim();
        org.ContactPosition = r.ContactPosition.Trim();
        org.ContactPhone = r.ContactPhone.Trim();
        org.NotificationEmail = AccountEmails.Normalize(r.NotificationEmail);
        org.UpdateContact = r.UpdateContact;
        org.UpdateContactDetails = r.UpdateContact.Length > 0 && r.UpdateContact != ReferenceData.UpdateContacts[0] ? r.UpdateContactDetails.Trim() : "";
        org.ReviewFrequency = r.ReviewFrequency;
        org.EngagementInterests = r.EngagementInterests.Distinct().ToList();
        org.AdminComments = r.AdminComments.Trim();

        org.RepresentativeName = r.RepresentativeName.Trim();
        org.ConsentedAt = DateTime.UtcNow;
    }
}
