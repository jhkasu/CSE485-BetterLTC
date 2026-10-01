namespace Backend.Email;

public interface IEmailSender {
    Task<bool> SendAsync(string to, OutgoingEmail message);
}

public record OutgoingEmail(string Subject, string Html, string Text);
