using Microsoft.EntityFrameworkCore;

namespace Backend.Models;

public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {
    }

    public DbSet<Admin> Admins { get; set; }
    public DbSet<Volunteer> Volunteers { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<OurWork> OurWorks { get; set; }
    public DbSet<HelpRequest> HelpRequests { get; set; }
    public DbSet<OrganizationLogo> OrganizationLogos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<Admin>()
            .HasIndex(a => a.Email)
            .IsUnique();

        modelBuilder.Entity<OrganizationLogo>()
            .HasOne<Organization>()
            .WithOne()
            .HasForeignKey<OrganizationLogo>(l => l.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HelpRequest>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(r => r.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<HelpRequest>()
            .HasIndex(r => r.Status);    }
}
