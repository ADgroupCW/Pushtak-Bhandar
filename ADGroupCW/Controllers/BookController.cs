using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [Route("api/books")] // 👈 Changed from "api/admin/books" to "api/books"
    [ApiController]
    [Authorize(Roles = "Admin")] // ✅ Only Admins can add books
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BookController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // ✅ POST /api/books/add — Create Book with image and metadata
        [HttpPost("add")] // 👈 Route becomes: /api/books/add
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateBook([FromForm] BookCreateDto dto, IFormFile? imageFile)
        {
            try
            {
                var result = await _bookService.CreateBookAsync(dto, imageFile);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔜 Future: Add GET/PUT/DELETE here
    }
}
