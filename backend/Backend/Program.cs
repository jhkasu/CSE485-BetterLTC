using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Backend.Models;
using Backend.Security;

var builder = WebApplication.CreateBuilder(args);
string[] allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddControllers();

var jwtSettings = JwtSettings.From(builder.Configuration);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton(builder.Configuration.GetSection("Admin").Get<AdminAccount>() ?? new AdminAccount());
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = jwtSettings.SigningKey,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1),
        NameClaimType = Roles.IdClaim,
        RoleClaimType = Roles.RoleClaim,
    };
});
builder.Services.AddAuthorization();

string usersDbConn = builder.Configuration.GetConnectionString("UsersDb")
    ?? throw new ArgumentNullException("[Users Database Connection String] string is null");
builder.Services.AddDbContext<UsersDbContext>(op => op.UseSqlite(usersDbConn));

string listingsDbConn = builder.Configuration.GetConnectionString("ListingsDb")
    ?? throw new ArgumentNullException("[Listings Database Connection String] string is null");
builder.Services.AddDbContext<ListingsDbContext>(op => op.UseSqlite(listingsDbConn));

var app = builder.Build();

// Apply pending migrations on startup in every environment so a fresh
// deployment creates its own tables.
using (var scope = app.Services.CreateScope()) {
    var usersDb = scope.ServiceProvider.GetRequiredService<UsersDbContext>();
    usersDb.Database.Migrate();
    PasswordHashing.UpgradeLegacyPasswords(usersDb);
    scope.ServiceProvider.GetRequiredService<ListingsDbContext>().Database.Migrate();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
