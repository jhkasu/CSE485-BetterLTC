using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class OurWork {
    [Key] public int Id { get; set; }
    [Required] public string Title { get; set; } = "";
    [Required] public string Content { get; set; } = "";
    public string Category { get; set; } = "";
    public string Date { get; set; } = "";
}
