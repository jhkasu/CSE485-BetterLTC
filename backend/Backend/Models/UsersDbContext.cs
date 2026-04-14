using Microsoft.EntityFrameworkCore;

namespace Backend.Models;

public class UsersDbContext : DbContext {
    public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options) {

    }

    public DbSet<Volunteer> Volunteers { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<OurWork> OurWorks { get; set; }
    public DbSet<HelpRequest> HelpRequests { get; set; }
}
