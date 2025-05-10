using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using ADGroupCW.Dtos;
using ADGroupCW.Services;

namespace ADGroupCW.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/bookmark")]
    public class BookmarkController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;

        public BookmarkController(IBookmarkService bookmarkService)
        {
            _bookmarkService = bookmarkService;
        }

        // 🔖 Add a book to bookmarks
        [HttpPost]
        public async Task<IActionResult> AddBookmark([FromBody] AddBookmarkDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user");

            var result = await _bookmarkService.AddBookmarkAsync(userId, dto.BookId);
            return result
                ? Ok(new { message = "Book bookmarked successfully." })
                : BadRequest(new { message = "Already bookmarked or failed." });
        }

        // 📑 Get bookmarks for logged-in user
        [HttpGet("my")]
        public async Task<ActionResult<List<BookmarkViewDto>>> GetUserBookmarks()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user");

            var bookmarks = await _bookmarkService.GetUserBookmarksAsync(userId);
            return Ok(bookmarks);
        }

        // ❌ Remove a bookmark
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveBookmark(int id)
        {
            var result = await _bookmarkService.RemoveBookmarkAsync(id);
            return result
                ? Ok(new { message = "Bookmark removed." })
                : NotFound(new { message = "Bookmark not found." });
        }
    }
}
