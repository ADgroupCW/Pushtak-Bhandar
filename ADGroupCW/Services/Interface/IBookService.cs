using ADGroupCW.Models;

namespace ADGroupCW.Services.Interface
{
    public interface IBookService
    {
        Task<List<Book>> GetAllBooksAsync();
        Task<List<Book>> GetSortedBooksAsync(string by);
        Task<Book> AddBookAsync(Book book);
    }
}
