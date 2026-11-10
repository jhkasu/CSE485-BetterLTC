using Microsoft.EntityFrameworkCore;
using Backend.Email;
using Backend.Models;

namespace Backend.Security;

public record UnverifiedAccount(string Role, int Id, string Email);

public static class EmailVerifications {
    public static readonly TimeSpan Lifetime = TimeSpan.FromHours(24);
    public const string NotVerified = "Please confirm your email before signing in.";

    public static async Task<bool> RecentlySent(AppDbContext db, string role, int accountId) {
        var since = DateTime.UtcNow - PasswordResets.ResendWait;
        return await db.EmailVerificationTokens.AnyAsync(t => t.Role == role && t.AccountId == accountId && t.UsedAt == null && t.CreatedAt > since);
    }

    public static async Task Send(AppDbContext db, IEmailSender email, string? site, UnverifiedAccount account, string language) {
        if (site is null) return;
        var previous = await db.EmailVerificationTokens
            .Where(t => t.Role == account.Role && t.AccountId == account.Id && t.UsedAt == null)
            .ToListAsync();
        db.EmailVerificationTokens.RemoveRange(previous);
        string token = PasswordResets.NewToken();
        var now = DateTime.UtcNow;
        db.EmailVerificationTokens.Add(new EmailVerificationToken {
            Role = account.Role,
            AccountId = account.Id,
            TokenHash = PasswordResets.Hash(token),
            CreatedAt = now,
            ExpiresAt = now + Lifetime,
        });
        await db.SaveChangesAsync();
        bool french = (language ?? "").StartsWith("fr", StringComparison.OrdinalIgnoreCase);
        await email.SendAsync(account.Email, VerificationEmails.Link($"{site}/verify-email?token={token}", french));
    }

    public static async Task SendAfterSignup(AppDbContext db, IEmailSender email, string? site, UnverifiedAccount account, string language) {
        try {
            await Send(db, email, site, account, language);
        } catch (Exception) {
        }
    }

    public static async Task<UnverifiedAccount?> FindUnverified(AppDbContext db, string email) {
        var volunteer = await db.Volunteers.FirstOrDefaultAsync(v => v.Email.Trim().ToLower() == email);
        if (volunteer is not null) return volunteer.EmailVerified ? null : new UnverifiedAccount(Roles.Volunteer, volunteer.Id, volunteer.Email);
        var org = await db.Organizations.FirstOrDefaultAsync(o => o.Email.Trim().ToLower() == email);
        if (org is not null) return org.EmailVerified ? null : new UnverifiedAccount(Roles.Organization, org.Id, org.Email);
        return null;
    }

    public static async Task<bool> MarkVerified(AppDbContext db, string role, int accountId) {
        if (role == Roles.Volunteer) {
            var volunteer = await db.Volunteers.FindAsync(accountId);
            if (volunteer is null) return false;
            volunteer.EmailVerified = true;
            return true;
        }
        if (role == Roles.Organization) {
            var org = await db.Organizations.FindAsync(accountId);
            if (org is null) return false;
            org.EmailVerified = true;
            return true;
        }
        return false;
    }
}
