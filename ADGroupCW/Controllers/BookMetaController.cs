using ADGroupCW.Dtos;
using ADGroupCW.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/meta")]
    public class BookMetaController : ControllerBase
    {
        private readonly IBookMetaService _service;

        public BookMetaController(IBookMetaService service)
        {
            _service = service;
        }

        [HttpGet("genres")]
        public async Task<IActionResult> GetGenres() => Ok(await _service.GetGenresAsync());

        [HttpPost("genres")]
        public async Task<IActionResult> AddGenre([FromBody] NameOnlyDto dto) => Ok(await _service.AddGenreAsync(dto));

        [HttpGet("publishers")]
        public async Task<IActionResult> GetPublishers() => Ok(await _service.GetPublishersAsync());

        [HttpPost("publishers")]
        public async Task<IActionResult> AddPublisher([FromBody] NameOnlyDto dto) => Ok(await _service.AddPublisherAsync(dto));

        [HttpGet("awards")]
        public async Task<IActionResult> GetAwards() => Ok(await _service.GetAwardsAsync());

        [HttpPost("awards")]
        public async Task<IActionResult> AddAward([FromBody] NameOnlyDto dto) => Ok(await _service.AddAwardAsync(dto));

        [HttpGet("formats")]
        public async Task<IActionResult> GetFormats() => Ok(await _service.GetFormatsAsync());

        [HttpPost("formats")]
        public async Task<IActionResult> AddFormat([FromBody] NameOnlyDto dto) => Ok(await _service.AddFormatAsync(dto));
    }
}
