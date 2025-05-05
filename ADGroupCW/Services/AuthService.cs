using ADGroupCW.Dtos;
using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace ADGroupCW.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TokenService _tokenService;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public AuthService(UserManager<ApplicationUser> userManager, TokenService tokenService, IMemoryCache cache, IEmailService emailService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _cache = cache;
            _emailService = emailService;
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            var existingEmail = await _userManager.FindByEmailAsync(dto.Email);
            var existingUsername = await _userManager.FindByNameAsync(dto.Username);

            if (existingEmail != null || existingUsername != null)
                throw new Exception("Email or username already in use.");

            var user = new ApplicationUser
            {
                UserName = dto.Username,
                Email = dto.Email,
                MembershipId = $"MBR-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errorMessage = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception(errorMessage);
            }

            await _userManager.AddToRoleAsync(user, "Member");

            // Generate and send OTP
            var otp = new Random().Next(100000, 999999).ToString();
            _cache.Set($"otp:{user.Email}", otp, TimeSpan.FromMinutes(5));
            await _emailService.SendEmailAsync(user.Email, "Email Verification OTP", $"Your OTP is: {otp}");

            return "Registered successfully. Please check your email for the OTP.";
        }

        public async Task<string> VerifyOtpAsync(OtpDto dto)
        {
            if (_cache.TryGetValue($"otp:{dto.Email}", out string? cachedOtp) && cachedOtp == dto.Otp)
            {
                var user = await _userManager.FindByEmailAsync(dto.Email);
                if (user == null) throw new Exception("User not found");

                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
                _cache.Remove($"otp:{dto.Email}");

                return "Email verified successfully.";
            }

            throw new Exception("Invalid or expired OTP.");
        }

        public async Task<string> ResendOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) throw new Exception("User not found");

            if (user.EmailConfirmed) return "Email is already verified.";

            var otp = new Random().Next(100000, 999999).ToString();
            _cache.Set($"otp:{email}", otp, TimeSpan.FromMinutes(5));
            await _emailService.SendEmailAsync(email, "Resend OTP", $"Your OTP is: {otp}");

            return "OTP resent successfully.";
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.EmailOrUsername)
                ?? await _userManager.FindByNameAsync(dto.EmailOrUsername);

            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                throw new Exception("Invalid login credentials");

            if (!user.EmailConfirmed)
                throw new Exception("Please verify your email before logging in.");

            return await _tokenService.GenerateTokenAsync(user);
        }
    }
}
