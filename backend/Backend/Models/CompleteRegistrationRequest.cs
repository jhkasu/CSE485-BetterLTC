using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class CompleteRegistrationRequest {
    [Range(0.25, 1000)] public double Hours { get; set; }
}
