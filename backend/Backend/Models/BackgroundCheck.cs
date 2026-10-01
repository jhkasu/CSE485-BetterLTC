using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class BackgroundCheck {
    [Key] public int Id { get; set; }
    public int VolunteerId { get; set; }
    public string Status { get; set; } = BackgroundCheckStatuses.ConsentGiven;
    public DateTime ConsentedAt { get; set; }
    public string FileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long FileSize { get; set; }
    public byte[]? FileData { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public int? ReviewedByAdminId { get; set; }
    public string RejectionReason { get; set; } = "";
    public DateOnly? ExpiresOn { get; set; }

    public bool IsExpired(DateOnly today) {
        return Status == BackgroundCheckStatuses.Approved && ExpiresOn is not null && ExpiresOn < today;
    }

    public string CurrentStatus(DateOnly today) {
        return IsExpired(today) ? BackgroundCheckStatuses.Expired : Status;
    }
}

public static class BackgroundCheckStatuses {
    public const string ConsentGiven = "ConsentGiven";
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Expired = "Expired";
}
