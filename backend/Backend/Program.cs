using Microsoft.EntityFrameworkCore;
using Backend.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.SetIsOriginAllowed(origin => origin.StartsWith("http://localhost"))
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

if (app.Environment.IsDevelopment()) {
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<UsersDbContext>().Database.Migrate();
    scope.ServiceProvider.GetRequiredService<ListingsDbContext>().Database.Migrate();
}

app.UseCors();
app.UseStaticFiles();
app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
