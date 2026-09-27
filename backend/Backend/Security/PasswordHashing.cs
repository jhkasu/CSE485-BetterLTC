using Backend.Models;

namespace Backend.Security;

public static class PasswordHashing {
    public static string Hash(string password) {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool Verify(string password, string hash) {
        if (!IsHash(hash)) return false;
        try {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        } catch (BCrypt.Net.SaltParseException) {
            return false;
        }
    }

    public static bool IsHash(string value) {
        return value.Length == 60 && value.StartsWith("$2");
    }

    public static int UpgradeLegacyPasswords(UsersDbContext db) {
        int upgraded = 0;
        foreach (var volunteer in db.Volunteers.ToList()) {
            if (IsHash(volunteer.Password)) continue;
            volunteer.Password = Hash(volunteer.Password);
            upgraded++;
        }
        foreach (var org in db.Organizations.ToList()) {
            if (IsHash(org.Password)) continue;
            org.Password = Hash(org.Password);
            upgraded++;
        }
        if (upgraded > 0) db.SaveChanges();
        return upgraded;
    }
}
