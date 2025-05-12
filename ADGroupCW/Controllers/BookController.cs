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

        // add a new book to the system
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

        // Retrieve all books from the system
        [HttpGet]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        // READ BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        // UPDATE an existing books details using id
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

        // remove a book by its id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var deleted = await _bookService.DeleteBookAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        // get books marked as new release
        [HttpGet("new-releases")]
        public async Task<IActionResult> GetNewReleases()
        {
            var books = await _bookService.GetNewReleasesAsync();
            return Ok(books);
        }

        // get books that have won awards
        [HttpGet("award-winners")]
        public async Task<IActionResult> GetAwardWinners()
        {
            var books = await _bookService.GetAwardWinnersAsync();
            return Ok(books);
        }

        // Deals
        [HttpGet("deals")]
        public async Task<IActionResult> GetDeals()
        {
            var books = await _bookService.GetDealsAsync();
            return Ok(books);
        }

        //Best Sellers
        [HttpGet("best-sellers")]
        public async Task<IActionResult> GetBestSellers()
        {
            var books = await _bookService.GetBestSellersAsync();
            return Ok(books);
        }

        // get books which are just newly arrived
        [HttpGet("new-arrivals")]
        public async Task<IActionResult> GetNewArrivals()
        {
            var books = await _bookService.GetNewArrivalsAsync();
            return Ok(books);
        }

        // get all categorized homepage book sections
        [HttpGet("homepage")]
        public async Task<IActionResult> GetHomepageBooks()
        {
            var result = await _bookService.GetHomepageBooksAsync();
            return Ok(result);
        }
    }
}
