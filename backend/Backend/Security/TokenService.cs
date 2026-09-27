using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Security;

public class TokenService {
    private readonly JwtSettings _settings;
    private readonly JsonWebTokenHandler _handler = new();

    public TokenService(JwtSettings settings) {
        _settings = settings;
    }

    public string Create(int id, string role, string email, string name) {
        var descriptor = new SecurityTokenDescriptor {
            Issuer = _settings.Issuer,
            Audience = _settings.Audience,
            Expires = DateTime.UtcNow.AddMinutes(_settings.ExpiresMinutes),
            SigningCredentials = new SigningCredentials(_settings.SigningKey, SecurityAlgorithms.HmacSha256),
            Claims = new Dictionary<string, object> {
                [Roles.IdClaim] = id.ToString(),
                [Roles.RoleClaim] = role,
                ["email"] = email,
                ["name"] = name,
            },
        };
        return _handler.CreateToken(descriptor);
    }
}
