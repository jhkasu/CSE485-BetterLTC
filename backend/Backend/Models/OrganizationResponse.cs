namespace Backend.Models;

public class OrganizationPublicResponse {
    public int Id { get; set; }
    public string OrgName { get; set; } = "";
    public string OrgType { get; set; } = "";
    public string OrgTypeOther { get; set; } = "";
    public int? YearEstablished { get; set; }
    public List<string> GeographicScope { get; set; } = [];
    public string CommunitiesServed { get; set; } = "";
    public List<string> ServiceAreas { get; set; } = [];
    public string City { get; set; } = "";
    public string Province { get; set; } = "";
    public string AdditionalLocations { get; set; } = "";
    public string Website { get; set; } = "";
    public string Facebook { get; set; } = "";
    public string Instagram { get; set; } = "";
    public string LinkedIn { get; set; } = "";
    public string YouTube { get; set; } = "";
    public string TikTok { get; set; } = "";
    public string OtherSocial { get; set; } = "";
    public string Tagline { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string Mission { get; set; } = "";
    public string Vision { get; set; } = "";
    public string CoreValues { get; set; } = "";
    public string Story { get; set; } = "";
    public string Uniqueness { get; set; } = "";
    public string Goals { get; set; } = "";
    public List<string> Categories { get; set; } = [];
    public string CategoryOther { get; set; } = "";
    public List<string> PopulationsServed { get; set; } = [];
    public string PopulationOther { get; set; } = "";
    public List<string> ServiceLanguages { get; set; } = [];
    public string ServiceLanguageOther { get; set; } = "";
    public string LanguageServices { get; set; } = "";
    public bool OffersIntergenerational { get; set; }
    public long? LogoVersion { get; set; }

    public static OrganizationPublicResponse From(Organization o) {
        var response = new OrganizationPublicResponse();
        response.Fill(o);
        return response;
    }

    protected void Fill(Organization o) {
        Id = o.Id;
        OrgName = o.OrgName;
        OrgType = o.OrgType;
        OrgTypeOther = o.OrgTypeOther;
        YearEstablished = o.YearEstablished;
        GeographicScope = o.GeographicScope;
        CommunitiesServed = o.CommunitiesServed;
        ServiceAreas = o.ServiceAreas;
        City = o.City;
        Province = o.Province;
        AdditionalLocations = o.AdditionalLocations;
        Website = o.Website;
        Facebook = o.Facebook;
        Instagram = o.Instagram;
        LinkedIn = o.LinkedIn;
        YouTube = o.YouTube;
        TikTok = o.TikTok;
        OtherSocial = o.OtherSocial;
        Tagline = o.Tagline;
        ShortDescription = o.ShortDescription;
        Description = o.Description;
        Mission = o.Mission;
        Vision = o.Vision;
        CoreValues = o.CoreValues;
        Story = o.Story;
        Uniqueness = o.Uniqueness;
        Goals = o.Goals;
        Categories = o.Categories;
        CategoryOther = o.CategoryOther;
        PopulationsServed = o.PopulationsServed;
        PopulationOther = o.PopulationOther;
        ServiceLanguages = o.ServiceLanguages;
        ServiceLanguageOther = o.ServiceLanguageOther;
        LanguageServices = o.LanguageServices;
        OffersIntergenerational = o.OffersIntergenerational;
        LogoVersion = OrganizationLogoVersion.For(o);
    }
}

public class OrganizationResponse : OrganizationPublicResponse {
    public string ContactName { get; set; } = "";
    public string Email { get; set; } = "";
    public bool IsApproved { get; set; }
    public string RegistryType { get; set; } = "";
    public string RegistryNumber { get; set; } = "";
    public string RejectionReason { get; set; } = "";
    public string NotificationEmail { get; set; } = "";
    public string LegalName { get; set; } = "";
    public string StreetAddress { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string ContactPosition { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string UpdateContact { get; set; } = "";
    public string UpdateContactDetails { get; set; } = "";
    public string ReviewFrequency { get; set; } = "";
    public List<string> EngagementInterests { get; set; } = [];
    public string AdminComments { get; set; } = "";
    public string RepresentativeName { get; set; } = "";
    public DateTime? ConsentedAt { get; set; }

    public static new OrganizationResponse From(Organization o) {
        var response = new OrganizationResponse {
            ContactName = o.ContactName,
            Email = o.Email,
            IsApproved = o.IsApproved,
            RegistryType = o.RegistryType,
            RegistryNumber = o.RegistryNumber,
            RejectionReason = o.RejectionReason,
            NotificationEmail = o.NotificationEmail,
            LegalName = o.LegalName,
            StreetAddress = o.StreetAddress,
            PostalCode = o.PostalCode,
            ContactPosition = o.ContactPosition,
            ContactPhone = o.ContactPhone,
            UpdateContact = o.UpdateContact,
            UpdateContactDetails = o.UpdateContactDetails,
            ReviewFrequency = o.ReviewFrequency,
            EngagementInterests = o.EngagementInterests,
            AdminComments = o.AdminComments,
            RepresentativeName = o.RepresentativeName,
            ConsentedAt = o.ConsentedAt,
        };
        response.Fill(o);
        return response;
    }
}

public static class OrganizationLogoVersion {
    public static long? For(Organization o) {
        return o.LogoUpdatedAt is DateTime updated ? new DateTimeOffset(DateTime.SpecifyKind(updated, DateTimeKind.Utc)).ToUnixTimeMilliseconds() : null;
    }
}
