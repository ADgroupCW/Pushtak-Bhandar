using ADGroupCW.Dtos;

namespace ADGroupCW.Services.Interface
{
    public interface IAdminReviewService
    {
        Task<List<AdminReviewDto>> GetAllReviewsAsync();
        Task<bool> DeleteReviewAsync(int reviewId);
    }
}
