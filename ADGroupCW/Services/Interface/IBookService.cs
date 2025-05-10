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
    }
}
