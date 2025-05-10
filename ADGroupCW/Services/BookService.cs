
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
                Price = dto.Price,
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
                BookFormats = new List<BookFormat>()
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

                // Log incoming DTO values
                Console.WriteLine($"Title: {dto.Title}");
                Console.WriteLine($"Author: {dto.Author}");
                Console.WriteLine($"ISBN: {dto.ISBN}");
                Console.WriteLine($"PublicationDate: {dto.PublicationDate}");
                Console.WriteLine($"Price: {dto.Price}");
                Console.WriteLine($"GenreId: {dto.GenreId}, PublisherId: {dto.PublisherId}");
                Console.WriteLine($"Award IDs: {(dto.BookAwardIds != null ? string.Join(",", dto.BookAwardIds) : "null")}");
                Console.WriteLine($"Format IDs: {(dto.BookFormatIds != null ? string.Join(",", dto.BookFormatIds) : "null")}");
                Console.WriteLine($"ImageFile: {(dto.ImageFile != null ? dto.ImageFile.FileName : "null")}");

                var existing = await _context.Books
                    .Include(b => b.BookAwards)
                    .Include(b => b.BookFormats)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (existing == null)
                {
                    Console.WriteLine("[ERROR] Book not found");
                    return false;
                }

                // Update scalar fields
                existing.Title = dto.Title;
                existing.Author = dto.Author;
                existing.ISBN = dto.ISBN;
                existing.Description = dto.Description;
                existing.Language = dto.Language;
                existing.PublicationDate = dto.PublicationDate;
                existing.Price = dto.Price;
                existing.OriginalPrice = dto.OriginalPrice;
                existing.IsAvailableInStore = dto.IsAvailableInStore;
                existing.IsOnSale = dto.IsOnSale;
                existing.SaleStartDate = dto.SaleStartDate;
                existing.SaleEndDate = dto.SaleEndDate;
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
                    else Console.WriteLine($"[WARN] Genre ID {dto.GenreId} not found");
                }
                else if (!string.IsNullOrWhiteSpace(dto.GenreName))
                {
                    existing.Genre = await GetOrCreateGenreAsync(dto.GenreName);
                    Console.WriteLine($"[INFO] Created/found genre by name: {dto.GenreName}");
                }

                // Publisher
                if (dto.PublisherId.HasValue)
                {
                    var publisher = await _context.Publishers.FindAsync(dto.PublisherId.Value);
                    if (publisher != null) existing.Publisher = publisher;
                    else Console.WriteLine($"[WARN] Publisher ID {dto.PublisherId} not found");
                }
                else if (!string.IsNullOrWhiteSpace(dto.PublisherName))
                {
                    existing.Publisher = await GetOrCreatePublisherAsync(dto.PublisherName);
                    Console.WriteLine($"[INFO] Created/found publisher by name: {dto.PublisherName}");
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
                        else
                        {
                            Console.WriteLine($"[WARN] Award ID {idAward} not found");
                        }
                    }
                }
                if (dto.BookAwardNames != null)
                {
                    foreach (var name in dto.BookAwardNames)
                    {
                        var award = await GetOrCreateAwardAsync(name);
                        existing.BookAwards.Add(new BookAward { Award = award });
                        Console.WriteLine($"[INFO] Added award from name: {name}");
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
                        else
                        {
                            Console.WriteLine($"[WARN] Format ID {idFormat} not found");
                        }
                    }
                }
                if (dto.BookFormatNames != null)
                {
                    foreach (var name in dto.BookFormatNames)
                    {
                        var format = await GetOrCreateFormatAsync(name);
                        existing.BookFormats.Add(new BookFormat { Format = format });
                        Console.WriteLine($"[INFO] Added format from name: {name}");
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
                BookFormatNames = book.BookFormats?.Select(bf => bf.Format.Name).ToList()
            };
        }
    }
}
