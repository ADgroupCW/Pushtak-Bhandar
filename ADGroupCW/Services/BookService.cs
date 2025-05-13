
using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Models;
using ADGroupCW.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services.Implementations
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BookService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<BookResponseDto> CreateBookAsync(BookCreateDto dto)
        {
            var existingBook = await _context.Books.FirstOrDefaultAsync(b => b.ISBN == dto.ISBN);
            if (existingBook != null)
                throw new Exception("A book with this ISBN already exists.");


            // 1. Handle Genre
            var genre = dto.GenreId.HasValue
                ? await _context.Genres.FindAsync(dto.GenreId.Value)
                : !string.IsNullOrWhiteSpace(dto.GenreName)
                    ? await GetOrCreateGenreAsync(dto.GenreName)
                    : throw new Exception("Genre is required");

            // 2. Handle Publisher
            var publisher = dto.PublisherId.HasValue
                ? await _context.Publishers.FindAsync(dto.PublisherId.Value)
                : !string.IsNullOrWhiteSpace(dto.PublisherName)
                    ? await GetOrCreatePublisherAsync(dto.PublisherName)
                    : throw new Exception("Publisher is required");

            // 3. Handle Image Upload
            string imageUrl = "";

            if (dto.ImageFile != null)
            {
                var fileName = $"{Guid.NewGuid()}_{dto.ImageFile.FileName}";
                var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadsPath = Path.Combine(rootPath, "uploads");
                Directory.CreateDirectory(uploadsPath);
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                imageUrl = $"/uploads/{fileName}";
            }

            // ✅ 4. Convert DateTime fields to UTC
            var publicationDate = DateTime.SpecifyKind(dto.PublicationDate, DateTimeKind.Utc);
            DateTime? saleStart = dto.SaleStartDate.HasValue
                ? DateTime.SpecifyKind(dto.SaleStartDate.Value, DateTimeKind.Utc)
                : (DateTime?)null;

            DateTime? saleEnd = dto.SaleEndDate.HasValue
                ? DateTime.SpecifyKind(dto.SaleEndDate.Value, DateTimeKind.Utc)
                : (DateTime?)null;


            // 5. Create Book
            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                ISBN = dto.ISBN,
                Description = dto.Description,
                Language = dto.Language,
                PublicationDate = publicationDate,
                Price = dto.Price??0,
                OriginalPrice = dto.OriginalPrice,
                IsAvailableInStore = dto.IsAvailableInStore,
                IsOnSale = dto.IsOnSale,
                SaleStartDate = saleStart,
                SaleEndDate = saleEnd,
                StockCount = dto.StockCount,
                ImageUrl = imageUrl,
                Genre = genre,
                Publisher = publisher,
                BookAwards = new List<BookAward>(),
                BookFormats = new List<BookFormat>(),
                CreatedAt = DateTime.UtcNow,
            };

            // 6. Handle Awards
            if (dto.BookAwardIds != null)
            {
                foreach (var id in dto.BookAwardIds)
                {
                    var award = await _context.Awards.FindAsync(id);
                    if (award != null)
                        book.BookAwards.Add(new BookAward { Award = award });
                }
            }

            if (dto.BookAwardNames != null)
            {
                foreach (var name in dto.BookAwardNames)
                {
                    var award = await GetOrCreateAwardAsync(name);
                    book.BookAwards.Add(new BookAward { Award = award });
                }
            }

            // 7. Handle Formats
            if (dto.BookFormatIds != null)
            {
                foreach (var id in dto.BookFormatIds)
                {
                    var format = await _context.Formats.FindAsync(id);
                    if (format != null)
                        book.BookFormats.Add(new BookFormat { Format = format });
                }
            }

            if (dto.BookFormatNames != null)
            {
                foreach (var name in dto.BookFormatNames)
                {
                    var format = await GetOrCreateFormatAsync(name);
                    book.BookFormats.Add(new BookFormat { Format = format });
                }
            }

            // 8. Save and return
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return await MapToResponseDto(book);
        }


        public async Task<List<BookResponseDto>> GetAllBooksAsync()
        {
            var books = await _context.Books
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();

            return books.Select(b => MapToResponseDtoSync(b)).ToList();
        }

        public async Task<BookResponseDto?> GetBookByIdAsync(int id)
        {
            var book = await _context.Books
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .FirstOrDefaultAsync(b => b.Id == id);

            return book == null ? null : MapToResponseDtoSync(book);
        }

        public async Task<bool> UpdateBookAsync(int id, BookCreateDto dto)
        {
            try
            {
                Console.WriteLine($"[DEBUG] UpdateBookAsync started for Book ID: {id}");

                var existing = await _context.Books
                    .Include(b => b.BookAwards)
                    .Include(b => b.BookFormats)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (existing == null)
                {
                    Console.WriteLine("[ERROR] Book not found");
                    return false;
                }

                // ✅ Fix: Ensure all DateTimes are UTC
                var publicationDate = DateTime.SpecifyKind(dto.PublicationDate, DateTimeKind.Utc);
                DateTime? saleStart = dto.SaleStartDate.HasValue
                    ? DateTime.SpecifyKind(dto.SaleStartDate.Value, DateTimeKind.Utc)
                    : (DateTime?)null;

                DateTime? saleEnd = dto.SaleEndDate.HasValue
                    ? DateTime.SpecifyKind(dto.SaleEndDate.Value, DateTimeKind.Utc)
                    : (DateTime?)null;

                // Update scalar fields
                existing.Title = dto.Title;
                existing.Author = dto.Author;
                existing.ISBN = dto.ISBN;
                existing.Description = dto.Description;
                existing.Language = dto.Language;
                existing.PublicationDate = publicationDate;
                existing.Price = dto.Price ?? 0;
                existing.OriginalPrice = dto.OriginalPrice;
                existing.IsAvailableInStore = dto.IsAvailableInStore;
                existing.IsOnSale = dto.IsOnSale;
                existing.SaleStartDate = saleStart;
                existing.SaleEndDate = saleEnd;
                existing.StockCount = dto.StockCount;

                if (dto.ImageFile != null)
                {
                    var fileName = $"{Guid.NewGuid()}_{dto.ImageFile.FileName}";
                    var filePath = Path.Combine(_env.WebRootPath, "uploads", fileName);
                    Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }
                    existing.ImageUrl = $"/uploads/{fileName}";
                    Console.WriteLine($"[INFO] Image uploaded: {fileName}");
                }

                // Genre
                if (dto.GenreId.HasValue)
                {
                    var genre = await _context.Genres.FindAsync(dto.GenreId.Value);
                    if (genre != null) existing.Genre = genre;
                }
                else if (!string.IsNullOrWhiteSpace(dto.GenreName))
                {
                    existing.Genre = await GetOrCreateGenreAsync(dto.GenreName);
                }

                // Publisher
                if (dto.PublisherId.HasValue)
                {
                    var publisher = await _context.Publishers.FindAsync(dto.PublisherId.Value);
                    if (publisher != null) existing.Publisher = publisher;
                }
                else if (!string.IsNullOrWhiteSpace(dto.PublisherName))
                {
                    existing.Publisher = await GetOrCreatePublisherAsync(dto.PublisherName);
                }

                // Awards
                existing.BookAwards.Clear();
                if (dto.BookAwardIds != null)
                {
                    foreach (var idAward in dto.BookAwardIds)
                    {
                        var award = await _context.Awards.FindAsync(idAward);
                        if (award != null)
                        {
                            existing.BookAwards.Add(new BookAward { Award = award });
                        }
                    }
                }
                if (dto.BookAwardNames != null)
                {
                    foreach (var name in dto.BookAwardNames)
                    {
                        var award = await GetOrCreateAwardAsync(name);
                        existing.BookAwards.Add(new BookAward { Award = award });
                    }
                }

                // Formats
                existing.BookFormats.Clear();
                if (dto.BookFormatIds != null)
                {
                    foreach (var idFormat in dto.BookFormatIds)
                    {
                        var format = await _context.Formats.FindAsync(idFormat);
                        if (format != null)
                        {
                            existing.BookFormats.Add(new BookFormat { Format = format });
                        }
                    }
                }
                if (dto.BookFormatNames != null)
                {
                    foreach (var name in dto.BookFormatNames)
                    {
                        var format = await GetOrCreateFormatAsync(name);
                        existing.BookFormats.Add(new BookFormat { Format = format });
                    }
                }

                await _context.SaveChangesAsync();
                Console.WriteLine("[SUCCESS] Book updated successfully");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EXCEPTION] Update failed: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[INNER EXCEPTION] {ex.InnerException.Message}");
                return false;
            }
        }



        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        // --- Helper Methods ---

        private async Task<Genre> GetOrCreateGenreAsync(string name)
        {
            var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == name);
            if (genre != null) return genre;

            var newGenre = new Genre { Name = name };
            _context.Genres.Add(newGenre);
            await _context.SaveChangesAsync();
            return newGenre;
        }

        private async Task<Publisher> GetOrCreatePublisherAsync(string name)
        {
            var publisher = await _context.Publishers.FirstOrDefaultAsync(p => p.Name == name);
            if (publisher != null) return publisher;

            var newPublisher = new Publisher { Name = name };
            _context.Publishers.Add(newPublisher);
            await _context.SaveChangesAsync();
            return newPublisher;
        }

        private async Task<Award> GetOrCreateAwardAsync(string name)
        {
            var award = await _context.Awards.FirstOrDefaultAsync(a => a.Name == name);
            if (award != null) return award;

            var newAward = new Award { Name = name };
            _context.Awards.Add(newAward);
            await _context.SaveChangesAsync();
            return newAward;
        }

        private async Task<Format> GetOrCreateFormatAsync(string name)
        {
            var format = await _context.Formats.FirstOrDefaultAsync(f => f.Name == name);
            if (format != null) return format;

            var newFormat = new Format { Name = name };
            _context.Formats.Add(newFormat);
            await _context.SaveChangesAsync();
            return newFormat;
        }

        private async Task<BookResponseDto> MapToResponseDto(Book book)
        {
            await _context.Entry(book).Collection(b => b.BookAwards).Query().Include(ba => ba.Award).LoadAsync();
            await _context.Entry(book).Collection(b => b.BookFormats).Query().Include(bf => bf.Format).LoadAsync();

            return MapToResponseDtoSync(book);
        }

        private BookResponseDto MapToResponseDtoSync(Book book)
        {
            return new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                ISBN = book.ISBN,
                Description = book.Description,
                Language = book.Language,
                PublicationDate = book.PublicationDate,
                Price = book.Price,
                OriginalPrice = book.OriginalPrice,
                IsAvailableInStore = book.IsAvailableInStore,
                IsOnSale = book.IsOnSale,
                SaleStartDate = book.SaleStartDate,
                SaleEndDate = book.SaleEndDate,
                StockCount = book.StockCount,
                ImageUrl = book.ImageUrl,
                GenreName = book.Genre?.Name ?? "",
                PublisherName = book.Publisher?.Name ?? "",
                BookAwardNames = book.BookAwards?.Select(ba => ba.Award.Name).ToList(),
                BookFormatNames = book.BookFormats?.Select(bf => bf.Format.Name).ToList(),
                CreatedAt = book.CreatedAt,
                SoldCount = book.SoldCount,



            };
        }


        public async Task<List<BookResponseDto>> GetNewReleasesAsync()
        {
            var books = await _context.Books
                .OrderByDescending(b => b.PublicationDate)
                .Take(20)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();

            return books.Select(MapToResponseDtoSync).ToList();
        }

        public async Task<List<BookResponseDto>> GetAwardWinnersAsync()
        {
            var books = await _context.Books
                .Where(b => b.BookAwards.Any())
                .OrderByDescending(b => b.PublicationDate)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();

            return books.Select(MapToResponseDtoSync).ToList();
        }

        public async Task<List<BookResponseDto>> GetDealsAsync()
        {
            var now = DateTime.UtcNow;

            var books = await _context.Books
                .Where(b => b.IsOnSale && b.SaleStartDate <= now &&
                           (b.SaleEndDate == null || b.SaleEndDate >= now))
                .OrderBy(b => b.Price)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();

            return books.Select(MapToResponseDtoSync).ToList();
        }

        public async Task<List<BookResponseDto>> GetBestSellersAsync()
        {
            var books = await _context.Books
                .OrderByDescending(b => b.SoldCount)
                .Take(20)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();

            return books.Select(MapToResponseDtoSync).ToList();
        }

        public async Task<List<BookResponseDto>> GetNewArrivalsAsync()
        {
            var books = await _context.Books
                .OrderByDescending(b => b.CreatedAt)
                .Take(20)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.BookAwards).ThenInclude(ba => ba.Award)
                .Include(b => b.BookFormats).ThenInclude(bf => bf.Format)
                .ToListAsync();

            return books.Select(MapToResponseDtoSync).ToList();
        }


        public async Task<object> GetHomepageBooksAsync()
        {
            var now = DateTime.UtcNow;

            // 🔄 1. Disable expired deals
            var expiredBooks = await _context.Books
                .Where(b => b.IsOnSale && b.SaleEndDate != null && b.SaleEndDate < now)
                .ToListAsync();

            foreach (var book in expiredBooks)
            {
                book.IsOnSale = false;
            }

            if (expiredBooks.Any())
            {
                await _context.SaveChangesAsync();
            }

            // ✅ 2. Fetch all books including reviews
            var books = await _context.Books
                .Include(b => b.Reviews)
                .ToListAsync();

            // 🎯 3. Random featured books (limit 6)
            var randomBooks = books
                .OrderBy(b => Guid.NewGuid())
                .Take(6)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    Author = b.Author,
                    ImageUrl = b.ImageUrl,
                    Price = b.Price,
                    AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0
                })
                .ToList();

            // 🌟 4. Book of the Month (highest average rating)
            var bookOfTheMonth = books
                .Where(b => b.Reviews.Any())
                .OrderByDescending(b => b.Reviews.Average(r => r.Rating))
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    Author = b.Author,
                    ImageUrl = b.ImageUrl,
                    Price = b.Price,
                    AverageRating = b.Reviews.Average(r => r.Rating)
                })
                .FirstOrDefault();

            // ⚠️ 5. Fallback: If no book has reviews, select a random book that is on sale
            var fallbackBook = bookOfTheMonth;
            if (fallbackBook == null)
            {
                fallbackBook = books
                    .Where(b => b.IsOnSale && b.StockCount > 0)
                    .OrderBy(b => Guid.NewGuid())
                    .Select(b => new
                    {
                        b.Id,
                        b.Title,
                        Author = b.Author,
                        ImageUrl = b.ImageUrl,
                        Price = b.Price,
                        AverageRating = 0.0 // No reviews, so set to 0
                    })
                    .FirstOrDefault();
            }

            // 📦 6. Return the response
            return new
            {
                RandomBooks = randomBooks,
                BookOfTheMonth = fallbackBook
            };
        }






    }
}
