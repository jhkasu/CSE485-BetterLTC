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
    public DbSet<Listing> Listings { get; set; }
    public DbSet<Registration> Registrations { get; set; }
    public DbSet<BackgroundCheck> BackgroundChecks { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<Admin>()
            .HasIndex(a => a.Email)
            .IsUnique();

        modelBuilder.Entity<BackgroundCheck>()
            .HasOne<Volunteer>()
            .WithMany()
            .HasForeignKey(c => c.VolunteerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BackgroundCheck>()
            .HasIndex(c => c.VolunteerId)
            .IsUnique();

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.AccountRole, n.AccountId, n.CreatedAt });

        modelBuilder.Entity<HelpRequest>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(r => r.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<HelpRequest>()
            .HasIndex(r => r.Status);

        modelBuilder.Entity<Listing>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(l => l.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Registration>()
            .HasOne<Volunteer>()
            .WithMany()
            .HasForeignKey(r => r.VolunteerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Registration>()
            .HasOne<Listing>()
            .WithMany()
            .HasForeignKey(r => r.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Registration>()
            .HasIndex(r => new { r.VolunteerId, r.ListingId })
            .IsUnique();
    }
}
