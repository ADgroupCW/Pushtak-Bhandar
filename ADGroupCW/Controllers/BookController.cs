using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
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

        [HttpGet]
        public async Task<IActionResult> GetBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        [HttpGet("sort")]
        public async Task<IActionResult> GetSorted(string by)
        {
            var books = await _bookService.GetSortedBooksAsync(by);
            return Ok(books);
        }

        [HttpPost]
        public async Task<IActionResult> AddBook(Book book)
        {
            var newBook = await _bookService.AddBookAsync(book);
            return Ok(newBook);
        }
    }
}
