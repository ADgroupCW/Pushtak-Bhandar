// Services/ReviewService.cs
using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SubmitReviewAsync(string userId, ReviewDto dto)
        {
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.BookId == dto.BookId && r.UserId == userId);

            if (existingReview != null)
            {
                // Update only Rating and Comment — keep CreatedAt untouched
                existingReview.Rating = dto.Rating;
                existingReview.Comment = dto.Comment;
            }
            else
            {
                // Add new review
                var review = new Review
                {
                    BookId = dto.BookId,
                    UserId = userId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
            }

            return await _context.SaveChangesAsync() > 0;
        }


        public async Task<List<ReviewResponseDto>> GetReviewsForBookAsync(int bookId)
        {
            return await _context.Reviews
                .Where(r => r.BookId == bookId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDto
                {
                    Id = r.Id,
                    BookId = r.BookId,
                    UserId = r.UserId,
                    UserEmail = r.User.Email,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<BookReviewStatsDto> GetReviewStatsAsync(int bookId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.BookId == bookId)
                .ToListAsync();

            if (reviews.Count == 0)
            {
                return new BookReviewStatsDto
                {
                    BookId = bookId,
                    AverageRating = 0,
                    ReviewCount = 0
                };
            }

            return new BookReviewStatsDto
            {
                BookId = bookId,
                AverageRating = Math.Round(reviews.Average(r => r.Rating), 1),
                ReviewCount = reviews.Count
            };
        }
    }
}
