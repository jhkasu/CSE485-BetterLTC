namespace Backend.Models;

public record BackgroundCheckResponse(
    string Status,
    DateTime? ConsentedAt,
    string FileName,
    DateTime? SubmittedAt,
    DateTime? ReviewedAt,
    string RejectionReason,
    DateOnly? ExpiresOn) {
    public static readonly BackgroundCheckResponse NotStarted = new("NotStarted", null, "", null, null, "", null);

    public static BackgroundCheckResponse From(BackgroundCheck c, DateOnly today) {
        return new BackgroundCheckResponse(
            c.CurrentStatus(today), c.ConsentedAt, c.FileName, c.SubmittedAt, c.ReviewedAt, c.RejectionReason, c.ExpiresOn);
    }
}

public record BackgroundCheckReviewItem(
    int Id,
    int VolunteerId,
    string VolunteerName,
    string VolunteerEmail,
    string Status,
    string FileName,
    long FileSize,
    DateTime? SubmittedAt,
    DateTime? ReviewedAt,
    string RejectionReason,
    DateOnly? ExpiresOn,
    bool ExpiringSoon);

public class ApproveBackgroundCheckRequest {
    public DateOnly ExpiresOn { get; set; }
}

public class RejectBackgroundCheckRequest {
    public string Reason { get; set; } = "";
}
