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
    public DbSet<Resource> Resources { get; set; }
    public DbSet<ResourceFile> ResourceFiles { get; set; }
    public DbSet<FaqItem> FaqItems { get; set; }
    public DbSet<Testimonial> Testimonials { get; set; }
    public DbSet<TestimonialPhoto> TestimonialPhotos { get; set; }
    public DbSet<PageViewDaily> PageViewDailies { get; set; }
    public DbSet<ResourceDownloadDaily> ResourceDownloadDailies { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<Admin>()
            .HasIndex(a => a.Email)
            .IsUnique();

        modelBuilder.Entity<OrganizationLogo>()
            .HasOne<Organization>()
            .WithOne()
            .HasForeignKey<OrganizationLogo>(l => l.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ResourceFile>()
            .HasOne<Resource>()
            .WithOne()
            .HasForeignKey<ResourceFile>(f => f.ResourceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TestimonialPhoto>()
            .HasOne<Testimonial>()
            .WithOne()
            .HasForeignKey<TestimonialPhoto>(p => p.TestimonialId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PageViewDaily>()
            .HasIndex(v => new { v.Date, v.Path })
            .IsUnique();

        modelBuilder.Entity<ResourceDownloadDaily>()
            .HasIndex(d => new { d.Date, d.ResourceId })
            .IsUnique();

        modelBuilder.Entity<ResourceDownloadDaily>()
            .HasOne<Resource>()
            .WithMany()
            .HasForeignKey(d => d.ResourceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HelpRequest>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(r => r.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<HelpRequest>()
            .HasIndex(r => r.Status);    }
}
