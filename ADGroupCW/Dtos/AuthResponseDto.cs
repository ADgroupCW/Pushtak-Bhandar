namespace ADGroupCW.Dtos
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiry { get; set; }
        public string Role { get; set; } = "Member";
    }
}
