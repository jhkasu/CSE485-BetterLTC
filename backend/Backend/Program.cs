using Microsoft.EntityFrameworkCore;
using Backend.Models;

var builder = WebApplication.CreateBuilder(args);
// Services
builder.Services.AddControllers();
string usersDbConn = builder.Configuration.GetConnectionString("UsersDb")
    ?? throw new ArgumentNullException("[Users Database Connection String] string is null");
builder.Services.AddDbContext<UsersDbContext>(op => op.UseSqlite(usersDbConn));

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

// Middlewares
app.MapControllers();

app.Run();
