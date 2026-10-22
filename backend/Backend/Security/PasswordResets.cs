using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Security;

public record ResetAccount(string Role, int Id, string Email);

public static class PasswordResets {
    public static readonly TimeSpan Lifetime = TimeSpan.FromHours(1);
    public static readonly TimeSpan ResendWait = TimeSpan.FromMinutes(2);

    public static string NewToken() {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static string Hash(string token) {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }

    public static async Task<ResetAccount?> FindByEmail(AppDbContext db, string email) {
        var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email.Trim().ToLower() == email);
        if (admin is not null) return new ResetAccount(Roles.Admin, admin.Id, admin.Email);
        var volunteer = await db.Volunteers.FirstOrDefaultAsync(v => v.Email.Trim().ToLower() == email);
        if (volunteer is not null) return new ResetAccount(Roles.Volunteer, volunteer.Id, volunteer.Email);
        var org = await db.Organizations.FirstOrDefaultAsync(o => o.Email.Trim().ToLower() == email);
        if (org is not null) return new ResetAccount(Roles.Organization, org.Id, org.Email);
        return null;
    }

    public static async Task<IAccount?> FindById(AppDbContext db, string role, int id) {
        return role switch {
            Roles.Admin => await db.Admins.FindAsync(id),
            Roles.Volunteer => await db.Volunteers.FindAsync(id),
            Roles.Organization => await db.Organizations.FindAsync(id),
            _ => null,
        };
    }
}
