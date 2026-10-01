using Backend.Models;

namespace Backend.Security;

public class AdminAccount {
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string FirstName { get; set; } = "Admin";
    public string LastName { get; set; } = "";

    public bool CreateFirstAdmin(AppDbContext db) {
        if (db.Admins.Any()) return false;
        string email = AccountEmails.Normalize(Email);
        if (email.Length == 0 || string.IsNullOrEmpty(Password)) return false;
        db.Admins.Add(new Admin {
            FirstName = FirstName,
            LastName = LastName,
            Email = email,
            Password = PasswordHashing.Hash(Password),
        });
        db.SaveChanges();
        return true;
    }
}
