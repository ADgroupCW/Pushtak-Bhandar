using ADGroupCW.Data;
using ADGroupCW.Dtos;
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

        public async Task<Book> CreateBookAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<List<Book>> GetAllBooksAsync()
        {
            return await _context.Books
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();
        }

        public async Task<Book?> GetBookByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<bool> UpdateBookAsync(Book updatedBook)
        {
            var existing = await _context.Books.FindAsync(updatedBook.Id);
            if (existing == null) return false;

            _context.Entry(existing).CurrentValues.SetValues(updatedBook);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Book>> FilterByGenreAsync(int genreId)
        {
            return await _context.Books
                .Include(b => b.Genre)
                .Where(b => b.GenreId == genreId)
                .ToListAsync();
        }

        public async Task<List<Book>> GetBestSellersAsync()
        {
            return await _context.Books
                .Include(b => b.Reviews)
                .OrderByDescending(b => b.Reviews.Count)
                .Take(10)
                .ToListAsync();
        }

        public async Task<List<Book>> GetAwardWinnersAsync()
        {
            return await _context.Books
                .Include(b => b.BookAwards)
                .Where(b => b.BookAwards.Any())
                .ToListAsync();
        }

        public async Task<List<Book>> GetNewReleasesAsync()
        {
            var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
            return await _context.Books
                .Where(b => b.PublicationDate >= threeMonthsAgo)
                .ToListAsync();
        }

        public async Task<List<Book>> GetNewArrivalsAsync()
        {
            var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
            return await _context.Books
                .Where(b => b.CreatedAt >= oneMonthAgo)
                .ToListAsync();
        }

        public async Task<List<Book>> GetComingSoonAsync()
        {
            return await _context.Books
                .Where(b => b.PublicationDate > DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task<List<Book>> GetDealsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Books
                .Where(b => b.IsOnSale && b.SaleStartDate <= now && b.SaleEndDate >= now)
                .ToListAsync();
        }

        public async Task<List<Book>> FilterBooksAsync(BookFilterDto filter)
        {
            var query = _context.Books.AsQueryable();

            if (filter.GenreId.HasValue)
            {
                query = query.Where(b => b.GenreId == filter.GenreId.Value);
            }

            if (!string.IsNullOrEmpty(filter.Language))
            {
                query = query.Where(b => b.Language == filter.Language);
            }

            if (filter.IsOnSale.HasValue)
            {
                query = query.Where(b => b.IsOnSale == filter.IsOnSale.Value);
            }

            // You can add more filter conditions here as needed

            return await query
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();
        }
    }
}
