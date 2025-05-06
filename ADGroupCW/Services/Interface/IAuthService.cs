using ADGroupCW.Dtos;
using ADGroupCW.Models;

namespace ADGroupCW.Services.Interface
{
    public interface IAuthService
    {
        // Registration & Verification
        Task<string> RegisterAsync(RegisterDto dto);
        Task<string> ResendOtpAsync(string email);
        Task<string> VerifyOtpAsync(OtpDto dto);

        // Login
        Task<object> LoginAsync(LoginDto dto); // Success = AuthResponseDto, Failure = structured object

        // Forgot & Reset Password
        Task<string> ForgotPasswordAsync(string email);
        Task<string> VerifyForgotPasswordOtpAsync(OtpDto dto);
        Task<string> ResetPasswordAsync(ResetPasswordDto dto);

        // Change Password (logged-in user)
        Task<string> ChangePasswordAsync(ApplicationUser user, ChangePasswordDto dto);

        // Logout
        Task<string> LogoutAsync();
    }
}
