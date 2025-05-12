using ADGroupCW.Data;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services
{
    public class NewsletterService : INewsletterService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public NewsletterService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<bool> SubscribeAsync(string email)
        {
            // check if the email already belongs to a registered user 
            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            if (exists) return false; // Do nothing if already a user

            // Compose and send newsletter email to the new user
            var subject = "Thanks for subscribing to Pushtak Bhandar!";
            var body = "We're glad to have you on board. Stay tuned for updates, discounts, and more!";
            await _emailService.SendEmailAsync(email, subject, body);

            return true;
        }
    }

}
