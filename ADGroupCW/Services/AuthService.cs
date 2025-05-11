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
            // Check if email or username already exists
            var existingEmail = await _userManager.FindByEmailAsync(dto.Email);
            var existingUsername = await _userManager.FindByNameAsync(dto.Username);

            if (existingEmail != null || existingUsername != null)
                throw new Exception("Email or username already in use.");

            // Create user
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

            // Generate OTP and store as "verify-otp:<email>"
            var otp = new Random().Next(100000, 999999).ToString();
            _cache.Set($"verify-otp:{user.Email}", otp, TimeSpan.FromMinutes(5));

            // Send OTP to email
            await _emailService.SendEmailAsync(user.Email, "Email Verification OTP", $"Your OTP is: {otp}");

            return "Registered successfully. Please check your email for the OTP.";
        }



        public async Task<string> VerifyOtpAsync(OtpDto dto)
        {
            // 1. Retrieve OTP from cache using "verify-otp:<email>"
            if (_cache.TryGetValue($"verify-otp:{dto.Email}", out string? cachedOtp) && cachedOtp == dto.Otp)
            {
                // 2. Find user
                var user = await _userManager.FindByEmailAsync(dto.Email);
                if (user == null)
                    throw new Exception("User not found");

                // 3. Confirm their email
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);

                // 4. Remove OTP from cache
                _cache.Remove($"verify-otp:{dto.Email}");

                return "Email verified successfully.";
            }

            throw new Exception("Invalid or expired OTP.");
        }



        public async Task<string> ResendOtpAsync(string email)
        {
            // 1. Find user
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new Exception("User not found");

            // 2. If already verified, no need to resend
            if (user.EmailConfirmed)
                return "Email is already verified.";

            // 3. Remove any existing OTP
            _cache.Remove($"verify-otp:{email}");

            // 4. Generate and store new OTP
            var otp = new Random().Next(100000, 999999).ToString();
            _cache.Set($"verify-otp:{email}", otp, TimeSpan.FromMinutes(5));

            // 5. Send via email
            await _emailService.SendEmailAsync(email, "Resend OTP", $"Your OTP is: {otp}");

            return "OTP resent successfully.";
        }


        public async Task<object> LoginAsync(LoginDto dto)
        {
            // 1. Find user by email or username
            var user = await _userManager.FindByEmailAsync(dto.EmailOrUsername)
                ?? await _userManager.FindByNameAsync(dto.EmailOrUsername);

            // 2. If user not found or password invalid
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return new
                {
                    success = false,
                    message = "Invalid credentials",
                    code = "INVALID_LOGIN"
                };
            }

            // 3. If email not verified
            if (!user.EmailConfirmed)
            {
                return new
                {
                    success = false,
                    message = "Email not verified",
                    code = "EMAIL_NOT_VERIFIED",
                    redirectToOtp = true,
                    email = user.Email
                };
            }

            // 4. Generate token
            var tokenDto = await _tokenService.GenerateTokenAsync(user);

            // 5. Return success response with token
            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Code = "LOGIN_SUCCESS",
                Token = tokenDto.Token,
                Expiry = tokenDto.Expiry,
                Role = tokenDto.Role
            };
        }


        public async Task<string> ForgotPasswordAsync(string email)
        {
            // 1. Find user by email
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new Exception("User not found");

            // 2. Remove old reset OTP if exists
            _cache.Remove($"reset-otp:{email}");

            // 3. Generate new OTP
            var otp = new Random().Next(100000, 999999).ToString();

            // 4. Cache OTP for 5 minutes
            _cache.Set($"reset-otp:{email}", otp, TimeSpan.FromMinutes(5));

            // 5. Send OTP to email
            await _emailService.SendEmailAsync(email, "Password Reset OTP", $"Your OTP for password reset is: {otp}");

            return "OTP sent to your email for password reset.";
        }


        public async Task<string> VerifyForgotPasswordOtpAsync(OtpDto dto)
        {
            // 1. Check if OTP matches the cached value
            if (_cache.TryGetValue($"reset-otp:{dto.Email}", out string? cachedOtp) && cachedOtp == dto.Otp)
            {
                // 2. Remove the used OTP
                _cache.Remove($"reset-otp:{dto.Email}");

                // 3. Set temporary flag to allow password reset
                _cache.Set($"pwreset-allowed:{dto.Email}", true, TimeSpan.FromMinutes(5));

                return "OTP verified. You can now reset your password.";
            }

            throw new Exception("Invalid or expired OTP.");
        }



        public async Task<string> ResetPasswordAsync(ResetPasswordDto dto)
        {
            // 1. Check if reset is allowed via the cache
            if (!_cache.TryGetValue($"pwreset-allowed:{dto.Email}", out bool allowed) || !allowed)
                throw new Exception("OTP not verified or expired.");

            // 2. Get the user
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("User not found");

            // 3. Generate token and reset password
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // 4. Remove reset flag from cache
            _cache.Remove($"pwreset-allowed:{dto.Email}");

            return "Password has been reset successfully.";
        }


        public async Task<string> ChangePasswordAsync(ApplicationUser user, ChangePasswordDto dto)
        {
            // 1. Attempt to change the password using Identity's built-in method
            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            // 2. Handle failure
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            return "Password changed successfully.";
        }



        public Task<string> LogoutAsync()
        {
            // For stateless JWT, logout is handled on frontend by deleting the token
            // Optionally, token revocation logic can be added here in the future

            return Task.FromResult("Logged out successfully.");
        }

        public async Task<bool> VerifyCurrentPasswordAsync(ApplicationUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }




    }
}
