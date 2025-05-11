using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services
{
    public class AdminReviewService : IAdminReviewService
    {
        private readonly AppDbContext _context;

        public AdminReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminReviewDto>> GetAllReviewsAsync()
        {
            return await _context.Reviews
                .Include(r => r.Book)
                .Include(r => r.User)
                .Select(r => new AdminReviewDto
                {
                    Id = r.Id,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    UserId = r.UserId,
                    UserEmail = r.User.Email,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null) return false;

            _context.Reviews.Remove(review);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
