using ADGroupCW.Data;
using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Book>> GetAllBooksAsync()
        {
            return await _context.Books.ToListAsync();
        }

        public async Task<List<Book>> GetSortedBooksAsync(string by)
        {
            return by.ToLower() switch
            {
                "title" => await _context.Books.OrderBy(b => b.Title).ToListAsync(),
                "stock" => await _context.Books.OrderByDescending(b => b.Stock).ToListAsync(),
                _ => await _context.Books.OrderBy(b => b.Price).ToListAsync()
            };
        }

        public async Task<Book> AddBookAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }
    }
}
