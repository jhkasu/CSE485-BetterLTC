using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Notification {
    [Key] public int Id { get; set; }
    public string AccountRole { get; set; } = "";
    public int AccountId { get; set; }
    public string Type { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Detail { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
}

public static class NotificationTypes {
    public const string ApplicationApproved = "ApplicationApproved";
    public const string ApplicationRejected = "ApplicationRejected";
    public const string HoursRecorded = "HoursRecorded";
    public const string BackgroundCheckApproved = "BackgroundCheckApproved";
    public const string BackgroundCheckRejected = "BackgroundCheckRejected";
}
