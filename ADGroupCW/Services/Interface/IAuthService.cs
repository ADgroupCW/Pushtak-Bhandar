using ADGroupCW.Dtos;

namespace ADGroupCW.Services.Interface
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto dto);
        Task<string> VerifyOtpAsync(OtpDto dto);
        Task<string> ResendOtpAsync(string email);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
    }
}
