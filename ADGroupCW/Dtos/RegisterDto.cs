namespace ADGroupCW.Dtos
{
    public class RegisterDto
    {
        public string Username { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}