using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class FaqItem {
    [Key] public int Id { get; set; }
    [Required] public string Topic { get; set; } = "";
    [Required] public string QuestionEn { get; set; } = "";
    [Required] public string AnswerEn { get; set; } = "";
    public string QuestionFr { get; set; } = "";
    public string AnswerFr { get; set; } = "";
    public int SortOrder { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class FaqItemRequest {
    [Required] public string Topic { get; set; } = "";
    [Required, MaxLength(300)] public string QuestionEn { get; set; } = "";
    [Required, MaxLength(2000)] public string AnswerEn { get; set; } = "";
    [MaxLength(300)] public string QuestionFr { get; set; } = "";
    [MaxLength(2000)] public string AnswerFr { get; set; } = "";
}

public class FaqMoveRequest {
    public string Direction { get; set; } = "";
}
