using Microsoft.EntityFrameworkCore;

namespace Backend.Models;

public class ListingsDbContext : DbContext {
    public ListingsDbContext(DbContextOptions<ListingsDbContext> options) : base(options) {

    }

    public DbSet<Listing> Listings { get; set; }
}
