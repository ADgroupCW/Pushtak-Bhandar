using ADGroupCW.Dtos;
using ADGroupCW.Models;

namespace ADGroupCW.Services.Interface
{
    public interface IBookService
    {
        // ✅ Core CRUD
        Task<Book> CreateBookAsync(Book book);
        Task<List<Book>> GetAllBooksAsync();
        Task<Book?> GetBookByIdAsync(int id);
        Task<bool> UpdateBookAsync(Book updatedBook);
        Task<bool> DeleteBookAsync(int id);

        // ✅ Filter
        Task<List<Book>> FilterBooksAsync(BookFilterDto filter);

        // ✅ Specials
        Task<List<Book>> FilterByGenreAsync(int genreId);
        Task<List<Book>> GetBestSellersAsync();
        Task<List<Book>> GetAwardWinnersAsync();
        Task<List<Book>> GetNewReleasesAsync();
        Task<List<Book>> GetNewArrivalsAsync();
        Task<List<Book>> GetComingSoonAsync();
        Task<List<Book>> GetDealsAsync();
    }
}
