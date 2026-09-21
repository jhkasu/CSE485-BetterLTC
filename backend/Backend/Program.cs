using Microsoft.EntityFrameworkCore;
using Backend.Models;

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
    scope.ServiceProvider.GetRequiredService<UsersDbContext>().Database.Migrate();
    scope.ServiceProvider.GetRequiredService<ListingsDbContext>().Database.Migrate();
}

app.UseCors();
app.UseStaticFiles();
app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
