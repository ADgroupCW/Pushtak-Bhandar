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

        public async Task<Book> CreateBookAsync(BookCreateDto dto, IFormFile? imageFile)
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
                CreatedAt = DateTime.UtcNow
            };

            // ✅ Save image and generate URL
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "books");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                book.ImageUrl = $"/uploads/books/{uniqueFileName}";
            }

            // ✅ Validate and set Genre
            var genre = await _context.Genres.FindAsync(dto.GenreId)
                        ?? throw new Exception("Genre not found.");
            book.Genre = genre;

            // ✅ Validate and set Publisher
            var publisher = await _context.Publishers.FindAsync(dto.PublisherId)
                           ?? throw new Exception("Publisher not found.");
            book.Publisher = publisher;

            // ✅ Handle Many-to-Many: Awards
            if (dto.BookAwardIds != null && dto.BookAwardIds.Any())
            {
                book.BookAwards = new List<BookAward>();
                foreach (var awardId in dto.BookAwardIds)
                {
                    var award = await _context.Awards.FindAsync(awardId);
                    if (award == null) continue;

                    book.BookAwards.Add(new BookAward
                    {
                        AwardId = award.Id,
                        Award = award,
                        Book = book
                    });
                }
            }

            // ✅ Handle Many-to-Many: Formats
            if (dto.BookFormatIds != null && dto.BookFormatIds.Any())
            {
                book.BookFormats = new List<BookFormat>();
                foreach (var formatId in dto.BookFormatIds)
                {
                    var format = await _context.Formats.FindAsync(formatId);
                    if (format == null) continue;

                    book.BookFormats.Add(new BookFormat
                    {
                        FormatId = format.Id,
                        Format = format,
                        Book = book
                    });
                }
            }

            // ✅ Save book
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return book;
        }





    }
}
