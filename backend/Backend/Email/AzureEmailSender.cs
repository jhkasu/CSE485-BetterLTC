using Azure;
using Azure.Communication.Email;

namespace Backend.Email;

public class AzureEmailSender : IEmailSender {
    private readonly EmailSettings _settings;
    private readonly ILogger<AzureEmailSender> _logger;
    private readonly EmailClient? _client;

    public AzureEmailSender(EmailSettings settings, ILogger<AzureEmailSender> logger) {
        _settings = settings;
        _logger = logger;
        if (settings.IsConfigured) _client = new EmailClient(settings.ConnectionString);
    }

    public async Task<bool> SendAsync(string to, OutgoingEmail message) {
        if (_client is null) {
            _logger.LogWarning("Email is not configured; skipped sending \"{Subject}\".", message.Subject);
            return false;
        }
        try {
            var email = new EmailMessage(
                _settings.Sender,
                to,
                new EmailContent(message.Subject) { Html = message.Html, PlainText = message.Text });
            await _client.SendAsync(WaitUntil.Started, email);
            return true;
        } catch (Exception ex) {
            _logger.LogError(ex, "Failed to send \"{Subject}\".", message.Subject);
            return false;
        }
    }
}
