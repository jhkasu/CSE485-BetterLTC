using System.Security.Cryptography;
using System.Text;

namespace Backend.Security;

public class AdminAccount {
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string FirstName { get; set; } = "Admin";
    public string LastName { get; set; } = "";

    public bool Matches(string email, string password) {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrEmpty(Password)) return false;
        if (!string.Equals(Email.Trim(), email.Trim(), StringComparison.OrdinalIgnoreCase)) return false;
        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(Password), Encoding.UTF8.GetBytes(password));
    }
}
