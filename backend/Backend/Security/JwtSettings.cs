using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Security;

public class JwtSettings {
    public string Issuer { get; init; } = "BetterLTC";
    public string Audience { get; init; } = "BetterLTC";
    public int ExpiresMinutes { get; init; } = 480;
    public SymmetricSecurityKey SigningKey { get; init; } = null!;

    public static JwtSettings From(IConfiguration configuration) {
        var section = configuration.GetSection("Jwt");
        string? key = section["Key"];
        byte[] keyBytes = !string.IsNullOrEmpty(key) && Encoding.UTF8.GetByteCount(key) >= 32
            ? Encoding.UTF8.GetBytes(key)
            : RandomNumberGenerator.GetBytes(64);
        return new JwtSettings {
            Issuer = section["Issuer"] ?? "BetterLTC",
            Audience = section["Audience"] ?? "BetterLTC",
            ExpiresMinutes = int.TryParse(section["ExpiresMinutes"], out int minutes) && minutes > 0 ? minutes : 480,
            SigningKey = new SymmetricSecurityKey(keyBytes),
        };
    }
}
