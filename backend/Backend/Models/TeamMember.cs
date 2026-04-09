using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class TeamMember {
    [Key] public int Id { get; set; }
    public int? UserId { get; set; }
    [Required] public string Name { get; set; } = "";
    [Required] public string Position { get; set; } = "";
    public string Bio { get; set; } = "";
    [Column("ImageUrl")] public string ImagePath { get; set; } = "";
}
