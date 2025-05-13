using ADGroupCW.Dtos;
using System.Threading.Tasks;

namespace ADGroupCW.Services.Interface
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardDto> GetSummaryAsync();
        Task<List<MonthlyOrderDto>> GetMonthlyOrdersAsync();
        Task<List<RatingBreakdownDto>> GetRatingBreakdownAsync();
        Task<List<TopReviewedBookDto>> GetTopReviewedBooksAsync();
        Task<List<object>> GetMonthlyRevenueAsync();

    }
}