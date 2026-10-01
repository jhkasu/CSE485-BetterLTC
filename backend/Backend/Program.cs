using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Backend.Models;
using Backend.Security;
using Backend.Email;

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
builder.Services.AddSingleton(builder.Configuration.GetSection("Email").Get<EmailSettings>() ?? new EmailSettings());
builder.Services.AddSingleton<IEmailSender, AzureEmailSender>();
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

string databaseConn = builder.Configuration.GetConnectionString("Database")
    ?? throw new ArgumentNullException("[Database Connection String] string is null");
builder.Services.AddDbContext<AppDbContext>(op => op.UseNpgsql(databaseConn));

var app = builder.Build();

using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    PasswordHashing.UpgradeLegacyPasswords(db);
    (builder.Configuration.GetSection("Admin").Get<AdminAccount>() ?? new AdminAccount()).CreateFirstAdmin(db);
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
