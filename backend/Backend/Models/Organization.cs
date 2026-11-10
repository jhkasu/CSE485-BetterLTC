using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Organization : IAccount {
    [Key] public int Id { get; set; }
    [Required] public string OrgName { get; set; } = "";
    [Required] public string ContactName { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
    public bool IsApproved { get; set; } = false;
    public bool EmailVerified { get; set; }
    public string RegistryType { get; set; } = "";
    public string RegistryNumber { get; set; } = "";
    public string RejectionReason { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> ServiceAreas { get; set; } = [];
    public List<string> Categories { get; set; } = [];
    public bool OffersIntergenerational { get; set; }
    public string NotificationEmail { get; set; } = "";
    public string Website { get; set; } = "";
    public DateTime? LogoUpdatedAt { get; set; }

    public string LegalName { get; set; } = "";
    public string OrgType { get; set; } = "";
    public string OrgTypeOther { get; set; } = "";
    public int? YearEstablished { get; set; }
    public List<string> GeographicScope { get; set; } = [];
    public string CommunitiesServed { get; set; } = "";
    public string StreetAddress { get; set; } = "";
    public string City { get; set; } = "";
    public string Province { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string AdditionalLocations { get; set; } = "";
    public string Facebook { get; set; } = "";
    public string Instagram { get; set; } = "";
    public string LinkedIn { get; set; } = "";
    public string YouTube { get; set; } = "";
    public string TikTok { get; set; } = "";
    public string OtherSocial { get; set; } = "";

    public string Tagline { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Mission { get; set; } = "";
    public string Vision { get; set; } = "";
    public string CoreValues { get; set; } = "";
    public string Story { get; set; } = "";
    public string Uniqueness { get; set; } = "";
    public string Goals { get; set; } = "";

    public string CategoryOther { get; set; } = "";
    public List<string> PopulationsServed { get; set; } = [];
    public string PopulationOther { get; set; } = "";
    public List<string> ServiceLanguages { get; set; } = [];
    public string ServiceLanguageOther { get; set; } = "";
    public string LanguageServices { get; set; } = "";

    public string ContactPosition { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string UpdateContact { get; set; } = "";
    public string UpdateContactDetails { get; set; } = "";
    public string ReviewFrequency { get; set; } = "";
    public List<string> EngagementInterests { get; set; } = [];
    public string AdminComments { get; set; } = "";

    public string RepresentativeName { get; set; } = "";
    public DateTime? ConsentedAt { get; set; }
}
