using ADGroupCW.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Publisher> Publishers { get; set; }
        public DbSet<Format> Formats { get; set; }
        public DbSet<Award> Awards { get; set; }
        public DbSet<BookAward> BookAwards { get; set; }
        public DbSet<BookFormat> BookFormats { get; set; }
        public DbSet<Review> Reviews { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<ServiceAnnouncement> ServiceAnnouncements { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Composite keys for many-to-many relations
            builder.Entity<BookAward>()
                .HasKey(ba => new { ba.BookId, ba.AwardId });

            builder.Entity<BookFormat>()
                .HasKey(bf => new { bf.BookId, bf.FormatId });
        }
    }
}