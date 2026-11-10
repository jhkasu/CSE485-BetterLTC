using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class EmailVerificationToken {
    [Key] public int Id { get; set; }
    [Required] public string Role { get; set; } = "";
    public int AccountId { get; set; }
    [Required] public string TokenHash { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
}

public class VerifyEmailRequest {
    [Required, MaxLength(200)] public string Token { get; set; } = "";
}

public class ResendVerificationRequest {
    [Required, MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(10)] public string Language { get; set; } = "en";
}
