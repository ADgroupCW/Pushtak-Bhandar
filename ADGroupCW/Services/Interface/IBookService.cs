using ADGroupCW.Dtos;
using ADGroupCW.Models;

namespace ADGroupCW.Services.Interface
{
    public interface IBookService
    {
        Task<Book> CreateBookAsync(BookCreateDto dto, IFormFile? imageFile);
        //Task<List<BookResponseDto>> GetAllBooksAsync();
        //Task<BookResponseDto?> GetBookByIdAsync(int id);
        //Task<BookResponseDto> UpdateBookAsync(int id, BookUpdateDto dto);
        //Task<bool> DeleteBookAsync(int id);
        //Task<List<BookResponseDto>> SearchBooksAsync(BookSearchDto filters);
    }
}
