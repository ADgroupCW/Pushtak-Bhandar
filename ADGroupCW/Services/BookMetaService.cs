using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Models;
using ADGroupCW.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services.Implementations
{
    public class BookMetaService : IBookMetaService
    {
        private readonly AppDbContext _context;

        public BookMetaService(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GENRE
        public async Task<List<GenreReadDto>> GetGenresAsync()
        {
            return await _context.Genres
                .Select(g => new GenreReadDto { Id = g.Id, Name = g.Name })
                .ToListAsync();
        }

        public async Task<GenreReadDto> AddGenreAsync(NameOnlyDto dto)
        {
            var existing = await _context.Genres.FirstOrDefaultAsync(x => x.Name == dto.Name);
            if (existing != null)
                return new GenreReadDto { Id = existing.Id, Name = existing.Name };

            var genre = new Genre { Name = dto.Name };
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            return new GenreReadDto { Id = genre.Id, Name = genre.Name };
        }

        // ✅ PUBLISHER
        public async Task<List<PublisherReadDto>> GetPublishersAsync()
        {
            return await _context.Publishers
                .Select(p => new PublisherReadDto { Id = p.Id, Name = p.Name })
                .ToListAsync();
        }

        public async Task<PublisherReadDto> AddPublisherAsync(NameOnlyDto dto)
        {
            var existing = await _context.Publishers.FirstOrDefaultAsync(x => x.Name == dto.Name);
            if (existing != null)
                return new PublisherReadDto { Id = existing.Id, Name = existing.Name };

            var pub = new Publisher { Name = dto.Name };
            _context.Publishers.Add(pub);
            await _context.SaveChangesAsync();
            return new PublisherReadDto { Id = pub.Id, Name = pub.Name };
        }

        // ✅ AWARD
        public async Task<List<BookAwardReadDto>> GetAwardsAsync()
        {
            return await _context.Awards
                .Select(a => new BookAwardReadDto { Id = a.Id, Name = a.Name })
                .ToListAsync();
        }

        public async Task<BookAwardReadDto> AddAwardAsync(NameOnlyDto dto)
        {
            var existing = await _context.Awards.FirstOrDefaultAsync(x => x.Name == dto.Name);
            if (existing != null)
                return new BookAwardReadDto { Id = existing.Id, Name = existing.Name };

            var award = new Award { Name = dto.Name };
            _context.Awards.Add(award);
            await _context.SaveChangesAsync();
            return new BookAwardReadDto { Id = award.Id, Name = award.Name };
        }

        // ✅ FORMAT (replaces BookFormat)
        public async Task<List<BookFormatReadDto>> GetFormatsAsync()
        {
            return await _context.Formats
                .Select(f => new BookFormatReadDto { Id = f.Id, Name = f.Name })
                .ToListAsync();
        }

        public async Task<BookFormatReadDto> AddFormatAsync(NameOnlyDto dto)
        {
            var existing = await _context.Formats.FirstOrDefaultAsync(x => x.Name == dto.Name);
            if (existing != null)
                return new BookFormatReadDto { Id = existing.Id, Name = existing.Name };

            var format = new Format { Name = dto.Name };
            _context.Formats.Add(format);
            await _context.SaveChangesAsync();
            return new BookFormatReadDto { Id = format.Id, Name = format.Name };
        }
    }
}
