using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsletterController : ControllerBase
    {
        private readonly INewsletterService _newsletterService;

        public NewsletterController(INewsletterService newsletterService)
        {
            _newsletterService = newsletterService;
        }

        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeDto dto)
        {
            var sent = await _newsletterService.SubscribeAsync(dto.Email);
            if (!sent)
                return Ok("You're already a registered user — no email sent.");

            return Ok("Subscription email sent!");
        }
    }

}
