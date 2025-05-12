using ADGroupCW.Dtos;
using ADGroupCW.Models;

namespace ADGroupCW.Services.Interfaces
{
    public interface IBookMetaService
    {
    
        //Genre section manages the various formats in which books can be published
        Task<List<GenreReadDto>> GetGenresAsync();
        Task<GenreReadDto> AddGenreAsync(NameOnlyDto dto);

        //Publisher section retrieves a list of all registered publishers.
        Task<List<PublisherReadDto>> GetPublishersAsync();
        Task<PublisherReadDto> AddPublisherAsync(NameOnlyDto dto);

        //Award section retrieves a list of all registered book awards.
        Task<List<BookAwardReadDto>> GetAwardsAsync();
        Task<BookAwardReadDto> AddAwardAsync(NameOnlyDto dto);

        // Format section Retrieves a list of all supported book format
        Task<List<BookFormatReadDto>> GetFormatsAsync();
        Task<BookFormatReadDto> AddFormatAsync(NameOnlyDto dto);
    }
}
