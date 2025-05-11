
using ADGroupCW.Dtos;

namespace ADGroupCW.Services.Interface
{
    public interface IReviewService
    {
        Task<bool> SubmitReviewAsync(string userId, ReviewDto dto);
        Task<List<ReviewResponseDto>> GetReviewsForBookAsync(int bookId);

        Task<BookReviewStatsDto> GetReviewStatsAsync(int bookId);
    }
}
