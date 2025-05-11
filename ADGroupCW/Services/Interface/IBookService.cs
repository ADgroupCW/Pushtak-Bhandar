using ADGroupCW.Dtos;

namespace ADGroupCW.Services
{
    public interface IBookService
    {
        // Create a new book with full metadata support (IDs or Names)
        Task<BookResponseDto> CreateBookAsync(BookCreateDto dto);

        // Get all books in the system
        Task<List<BookResponseDto>> GetAllBooksAsync();

        // Get a single book by ID
        Task<BookResponseDto?> GetBookByIdAsync(int id);

        // Update an existing book (reuse BookCreateDto for simplicity)
        Task<bool> UpdateBookAsync(int id, BookCreateDto dto);

        // Delete a book by ID
        Task<bool> DeleteBookAsync(int id);


        Task<List<BookResponseDto>> GetNewReleasesAsync();      // Sort by PublicationDate DESC
        Task<List<BookResponseDto>> GetAwardWinnersAsync();     // Where Awards.Count > 0
        Task<List<BookResponseDto>> GetDealsAsync();            // Where IsOnSale == true
        Task<List<BookResponseDto>> GetBestSellersAsync();      // Sort by SoldCount DESC
        Task<List<BookResponseDto>> GetNewArrivalsAsync();      // Sort by CreatedAt DESC

        Task<object> GetHomepageBooksAsync();
    }
}
