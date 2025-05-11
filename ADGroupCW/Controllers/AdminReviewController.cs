using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/admin/reviews")]
    public class AdminReviewController : ControllerBase
    {
        private readonly IAdminReviewService _reviewService;

        public AdminReviewController(IAdminReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _reviewService.DeleteReviewAsync(id);
            if (!success) return NotFound(new { message = "Review not found" });

            return Ok(new { message = "Review deleted successfully" });
        }
    }
}
