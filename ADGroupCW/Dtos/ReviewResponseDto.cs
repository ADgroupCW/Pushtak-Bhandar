namespace ADGroupCW.Dtos
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string UserId { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
