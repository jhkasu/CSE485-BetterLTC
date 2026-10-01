namespace Backend.Email;

public class EmailSettings {
    public string ConnectionString { get; set; } = "";
    public string Sender { get; set; } = "";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ConnectionString) && !string.IsNullOrWhiteSpace(Sender);
}
