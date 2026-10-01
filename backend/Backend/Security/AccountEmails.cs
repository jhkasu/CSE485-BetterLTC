using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Security;

public static class AccountEmails {
    public const string AlreadyRegistered = "This email is already registered.";

    public static string Normalize(string? email) {
        return (email ?? "").Trim().ToLowerInvariant();
    }

    public static async Task<bool> IsTaken(AppDbContext db, AdminAccount admin, string email) {
        string normalized = Normalize(email);
        if (normalized.Length == 0) return false;
        if (Normalize(admin.Email) == normalized) return true;
        if (await db.Volunteers.AnyAsync(v => v.Email.Trim().ToLower() == normalized)) return true;
        return await db.Organizations.AnyAsync(o => o.Email.Trim().ToLower() == normalized);
    }
}
