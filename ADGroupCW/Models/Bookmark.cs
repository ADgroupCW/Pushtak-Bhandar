namespace ADGroupCW.Models
{
    public class Bookmark
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int BookId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation (optional)
        public Book Book { get; set; }
    }

}
