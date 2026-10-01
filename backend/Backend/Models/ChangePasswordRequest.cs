using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class ChangePasswordRequest {
    [Required] public string CurrentPassword { get; set; } = "";
    [Required, MinLength(8)] public string NewPassword { get; set; } = "";
}
