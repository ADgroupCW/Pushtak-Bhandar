namespace ADGroupCW.Dtos
{
    public class AuthResponseDto
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Login successful";
        public string Code { get; set; } = "LOGIN_SUCCESS";

        public string Token { get; set; } = string.Empty;
        public DateTime Expiry { get; set; }
        public string Role { get; set; } = "Member";
    }
}
