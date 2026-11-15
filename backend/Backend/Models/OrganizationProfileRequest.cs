using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class OrganizationProfileRequest {
    [Required, MaxLength(200)] public string OrgName { get; set; } = "";
    [MaxLength(200)] public string LegalName { get; set; } = "";
    [MaxLength(100)] public string OrgType { get; set; } = "";
    [MaxLength(200)] public string OrgTypeOther { get; set; } = "";
    public int? YearEstablished { get; set; }
    public List<string> GeographicScope { get; set; } = [];
    [MaxLength(500)] public string CommunitiesServed { get; set; } = "";
    public List<string> ServiceAreas { get; set; } = [];
    [MaxLength(200)] public string StreetAddress { get; set; } = "";
    [MaxLength(100)] public string City { get; set; } = "";
    [MaxLength(100)] public string Province { get; set; } = "";
    [MaxLength(20)] public string PostalCode { get; set; } = "";
    public bool HideStreetAddress { get; set; }
    [MaxLength(500)] public string AdditionalLocations { get; set; } = "";
    [MaxLength(300)] public string Website { get; set; } = "";
    [MaxLength(300)] public string Facebook { get; set; } = "";
    [MaxLength(300)] public string Instagram { get; set; } = "";
    [MaxLength(300)] public string LinkedIn { get; set; } = "";
    [MaxLength(300)] public string YouTube { get; set; } = "";
    [MaxLength(300)] public string TikTok { get; set; } = "";
    [MaxLength(300)] public string OtherSocial { get; set; } = "";

    [MaxLength(200)] public string Tagline { get; set; } = "";
    [MaxLength(1000)] public string ShortDescription { get; set; } = "";
    [MaxLength(3000)] public string Description { get; set; } = "";
    [MaxLength(2000)] public string Mission { get; set; } = "";
    [MaxLength(2000)] public string Vision { get; set; } = "";
    [MaxLength(2000)] public string CoreValues { get; set; } = "";
    [MaxLength(2000)] public string Story { get; set; } = "";
    [MaxLength(2000)] public string Uniqueness { get; set; } = "";
    [MaxLength(2000)] public string Goals { get; set; } = "";

    public List<string> Categories { get; set; } = [];
    [MaxLength(200)] public string CategoryOther { get; set; } = "";
    public List<string> PopulationsServed { get; set; } = [];
    [MaxLength(200)] public string PopulationOther { get; set; } = "";
    public List<string> ServiceLanguages { get; set; } = [];
    [MaxLength(200)] public string ServiceLanguageOther { get; set; } = "";
    [MaxLength(1000)] public string LanguageServices { get; set; } = "";
    public bool OffersIntergenerational { get; set; }

    [MaxLength(200)] public string ContactName { get; set; } = "";
    [MaxLength(200)] public string ContactPosition { get; set; } = "";
    [MaxLength(40)] public string ContactPhone { get; set; } = "";
    [MaxLength(200)] public string NotificationEmail { get; set; } = "";
    [MaxLength(100)] public string UpdateContact { get; set; } = "";
    [MaxLength(300)] public string UpdateContactDetails { get; set; } = "";
    [MaxLength(100)] public string ReviewFrequency { get; set; } = "";
    public List<string> EngagementInterests { get; set; } = [];
    [MaxLength(2000)] public string AdminComments { get; set; } = "";

    public bool ConfirmAuthorized { get; set; }
    public bool ConfirmAccurate { get; set; }
    public bool ConfirmPublication { get; set; }
    public bool ConfirmMedia { get; set; }
    public bool ConfirmUpdates { get; set; }
    [MaxLength(200)] public string RepresentativeName { get; set; } = "";
}
