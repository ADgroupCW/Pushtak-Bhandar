using ADGroupCW.Dtos;
using ADGroupCW.Models;

namespace ADGroupCW.Services.Interfaces
{
    public interface IBookMetaService
    {
        // ✅ Genre
        Task<List<GenreReadDto>> GetGenresAsync();
        Task<GenreReadDto> AddGenreAsync(NameOnlyDto dto);

        // ✅ Publisher
        Task<List<PublisherReadDto>> GetPublishersAsync();
        Task<PublisherReadDto> AddPublisherAsync(NameOnlyDto dto);

        // ✅ Award
        Task<List<BookAwardReadDto>> GetAwardsAsync();
        Task<BookAwardReadDto> AddAwardAsync(NameOnlyDto dto);

        // ✅ Format
        Task<List<BookFormatReadDto>> GetFormatsAsync();
        Task<BookFormatReadDto> AddFormatAsync(NameOnlyDto dto);
    }
}
