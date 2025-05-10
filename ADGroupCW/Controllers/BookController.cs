using ADGroupCW.Dtos;
using ADGroupCW.Services;
using ADGroupCW.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BookController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // ✅ CREATE
        [HttpPost]
        public async Task<IActionResult> CreateBook([FromForm] BookCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(x => x.Errors)
                    .Select(x => x.ErrorMessage));
                return BadRequest($"Model binding failed: {errors}");
            }

            var result = await _bookService.CreateBookAsync(dto);
            return Ok(result);
        }


        // ✅ READ ALL
        [HttpGet]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        // ✅ READ BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] BookCreateDto dto)
        {
            Console.WriteLine($"📥 [Controller] PUT /api/book/{id} called");

            if (!ModelState.IsValid)
            {
                var errors = string.Join(" | ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage));
                Console.WriteLine($"❌ ModelState Invalid: {errors}");
                return BadRequest("Model binding failed: " + errors);
            }

            var success = await _bookService.UpdateBookAsync(id, dto);
            if (!success)
            {
                Console.WriteLine("⚠️ Book not found or update failed");
                return NotFound();
            }

            Console.WriteLine("✅ Book update successful");
            return Ok();
        }




        // ✅ DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var deleted = await _bookService.DeleteBookAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
