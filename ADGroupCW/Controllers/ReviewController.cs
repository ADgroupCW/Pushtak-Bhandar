using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // POST: api/reviews
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> SubmitReview([FromBody] ReviewDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var result = await _reviewService.SubmitReviewAsync(userId, dto);

            if (!result)
                return BadRequest("You have already reviewed this book.");

            return Ok(new { message = "Review submitted successfully." });
        }

        // GET: api/reviews/book/5
        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetReviewsForBook(int bookId)
        {
            var reviews = await _reviewService.GetReviewsForBookAsync(bookId);
            return Ok(reviews);
        }

        [HttpGet("stats/{bookId}/average")]
        [AllowAnonymous] // Allow public access
        public async Task<ActionResult<BookReviewStatsDto>> GetReviewStats(int bookId)
        {
            var stats = await _reviewService.GetReviewStatsAsync(bookId);
            return Ok(stats);
        }
    }
}
