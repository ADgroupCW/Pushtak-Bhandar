using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;

        public AdminDashboardController(IAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // ✅ Dashboard Summary Cards
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var data = await _dashboardService.GetSummaryAsync();
            return Ok(data);
        }

        // 📊 Monthly Orders (line chart)
        [HttpGet("orders/monthly")]
        public async Task<IActionResult> GetMonthlyOrders()
        {
            var data = await _dashboardService.GetMonthlyOrdersAsync();
            return Ok(data);
        }

        // ⭐ Ratings Breakdown (bar chart)
        [HttpGet("ratings/breakdown")]
        public async Task<IActionResult> GetRatingsBreakdown()
        {
            var data = await _dashboardService.GetRatingBreakdownAsync();
            return Ok(data);
        }

        // 🏆 Top Reviewed Books (horizontal bar)
        [HttpGet("reviews/top-books")]
        public async Task<IActionResult> GetTopReviewedBooks()
        {
            var data = await _dashboardService.GetTopReviewedBooksAsync();
            return Ok(data);
        }

        // 💸 Monthly Revenue (line or area chart)
        [HttpGet("revenue/monthly")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var data = await _dashboardService.GetMonthlyRevenueAsync();
            return Ok(data);
        }
    }
}
