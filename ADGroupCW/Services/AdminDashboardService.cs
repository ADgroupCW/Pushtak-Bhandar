using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly AppDbContext _context;

        public AdminDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardDto> GetSummaryAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalBooks = await _context.Books.CountAsync();
            var totalOrders = await _context.Orders.CountAsync();
            var activeOrders = await _context.Orders
                .CountAsync(o => o.Status == "Pending" || o.Status == "Processing");
            var totalReviews = await _context.Reviews.CountAsync();

            var topRated = await _context.Reviews
                .GroupBy(r => r.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    AvgRating = g.Average(r => r.Rating)
                })
                .OrderByDescending(g => g.AvgRating)
                .FirstOrDefaultAsync();

            var topBook = topRated != null
                ? await _context.Books
                    .Where(b => b.Id == topRated.BookId)
                    .Select(b => b.Title)
                    .FirstOrDefaultAsync()
                : "N/A";

            return new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalBooks = totalBooks,
                TotalOrders = totalOrders,
                ActiveOrders = activeOrders,
                TotalReviews = totalReviews,
                TopRatedBook = topBook,
                TopRatedBookAverage = Math.Round(topRated?.AvgRating ?? 0, 1)
            };
        }


        public async Task<List<MonthlyOrderDto>> GetMonthlyOrdersAsync()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);

            return _context.Orders
            .Where(o => o.OrderedAt >= sixMonthsAgo)
            .AsEnumerable()
            .GroupBy(o => o.OrderedAt.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new MonthlyOrderDto
            {
                Month = g.Key,
                OrderCount = g.Count()
            })
            .ToList(); // ✅ FIXED: Use ToList() here

        }


        public async Task<List<RatingBreakdownDto>> GetRatingBreakdownAsync()
        {
            return await _context.Reviews
                .GroupBy(r => r.Rating)
                .Select(g => new RatingBreakdownDto
                {
                    Rating = g.Key,
                    Count = g.Count()
                }).OrderByDescending(g => g.Rating)
                .ToListAsync();
        }

        public async Task<List<TopReviewedBookDto>> GetTopReviewedBooksAsync()
        {
            // Step 1: Get top 5 reviewed book IDs with counts (on DB side)
            var topReviewGroups = await _context.Reviews
                .GroupBy(r => r.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    ReviewCount = g.Count()
                })
                .OrderByDescending(g => g.ReviewCount)
                .Take(5)
                .ToListAsync();

            // Step 2: Fetch book titles in-memory and return result
            var result = topReviewGroups
                .Join(_context.Books,
                      g => g.BookId,
                      b => b.Id,
                      (g, b) => new TopReviewedBookDto
                      {
                          Title = b.Title,
                          ReviewCount = g.ReviewCount
                      })
                .ToList();

            return result;
        }


        public async Task<List<object>> GetMonthlyRevenueAsync()
        {
            var cutoff = DateTime.UtcNow.AddMonths(-5);

            return _context.Orders
                .Where(o => o.OrderedAt >= cutoff && o.Status == "Completed")
                .AsEnumerable() // switch to client-side for formatting
                .GroupBy(o => new { o.OrderedAt.Year, o.OrderedAt.Month })
                .Select(g => new
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}", // safely format in C#
                    TotalRevenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(g => g.Month)
                .ToList<object>();
        }




    }
}
