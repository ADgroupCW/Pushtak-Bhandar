using ADGroupCW.Dtos;
using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly IBookService _bookService;

    public BookController(IBookService bookService)
    {
        _bookService = bookService;

    }

    [HttpPost]
    public async Task<IActionResult> CreateBook([FromBody] BookCreateDto dto)
    {
        var book = new Book
        {
            Title = dto.Title,
            Author = dto.Author,
            ISBN = dto.ISBN,
            Description = dto.Description,
            Language = dto.Language,
            PublicationDate = dto.PublicationDate,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            IsAvailableInStore = dto.IsAvailableInStore,
            IsOnSale = dto.IsOnSale,
            SaleStartDate = dto.SaleStartDate,
            SaleEndDate = dto.SaleEndDate,
            StockCount = dto.StockCount,
            ImageUrl = dto.ImageUrl,
            GenreId = dto.GenreId,
            PublisherId = dto.PublisherId
        };

        var result = await _bookService.CreateBookAsync(book);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] BookUpdateDto dto)
    {
        var book = new Book
        {
            Id = id,
            Title = dto.Title,
            Author = dto.Author,
            ISBN = dto.ISBN,
            Description = dto.Description,
            Language = dto.Language,
            PublicationDate = dto.PublicationDate,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            IsAvailableInStore = dto.IsAvailableInStore,
            IsOnSale = dto.IsOnSale,
            SaleStartDate = dto.SaleStartDate,
            SaleEndDate = dto.SaleEndDate,
            StockCount = dto.StockCount,
            ImageUrl = dto.ImageUrl,
            GenreId = dto.GenreId,
            PublisherId = dto.PublisherId
        };

        var success = await _bookService.UpdateBookAsync(book);
        return success ? Ok("Updated") : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var success = await _bookService.DeleteBookAsync(id);
        return success ? Ok("Deleted") : NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        var books = await _bookService.GetAllBooksAsync();
        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookById(int id)
    {
        var book = await _bookService.GetBookByIdAsync(id);
        return book == null ? NotFound() : Ok(book);
    }

    [HttpGet("genre/{genreId}")]
    public async Task<IActionResult> GetBooksByGenre(int genreId)
    {
        var books = await _bookService.FilterByGenreAsync(genreId);
        return Ok(books);
    }

    [HttpGet("bestsellers")]
    public async Task<IActionResult> GetBestSellers()
    {
        var books = await _bookService.GetBestSellersAsync();
        return Ok(books);
    }

    [HttpGet("award-winners")]
    public async Task<IActionResult> GetAwardWinners()
    {
        var books = await _bookService.GetAwardWinnersAsync();
        return Ok(books);
    }

    [HttpGet("new-releases")]
    public async Task<IActionResult> GetNewReleases()
    {
        var books = await _bookService.GetNewReleasesAsync();
        return Ok(books);
    }

    [HttpGet("new-arrivals")]
    public async Task<IActionResult> GetNewArrivals()
    {
        var books = await _bookService.GetNewArrivalsAsync();
        return Ok(books);
    }

    [HttpGet("coming-soon")]
    public async Task<IActionResult> GetComingSoon()
    {
        var books = await _bookService.GetComingSoonAsync();
        return Ok(books);
    }

    [HttpGet("deals")]
    public async Task<IActionResult> GetDeals()
    {
        var books = await _bookService.GetDealsAsync();
        return Ok(books);
    }

}