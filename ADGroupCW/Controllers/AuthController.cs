using ADGroupCW.Dtos;
using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<ApplicationUser> _userManager;

        public AuthController(IAuthService authService, UserManager<ApplicationUser> userManager)
        {
            _authService = authService;
            _userManager = userManager;
        }

        // 🔹 Register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(new { message = result });
        }

        // 🔹 Verify Email OTP
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] OtpDto dto)
        {
            var result = await _authService.VerifyOtpAsync(dto);
            return Ok(new { message = result });
        }

        // 🔹 Resend Email OTP
        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromQuery] string email)
        {
            var result = await _authService.ResendOtpAsync(email);
            return Ok(new { message = result });
        }

        // 🔹 Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }

        // 🔹 Forgot Password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            var result = await _authService.ForgotPasswordAsync(email);
            return Ok(new { message = result });
        }

        // 🔹 Verify OTP for Password Reset
        [HttpPost("verify-reset-otp")]
        public async Task<IActionResult> VerifyResetOtp([FromBody] OtpDto dto)
        {
            var result = await _authService.VerifyForgotPasswordOtpAsync(dto);
            return Ok(new { message = result });
        }

        // 🔹 Reset Password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var result = await _authService.ResetPasswordAsync(dto);
            return Ok(new { message = result });
        }

        // 🔹 Change Password (must be logged in)
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null) return Unauthorized("Invalid user.");

            var result = await _authService.ChangePasswordAsync(user, dto);
            return Ok(new { message = result });
        }

        // 🔹 Logout (stateless)
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var result = await _authService.LogoutAsync();
            return Ok(new { message = result });
        }
    }
}
