namespace ADGroupCW.Models
{
    public class Bookmark
    {
        public int BookmarkID { get; set; }

        public int UserID { get; set; }
        public int BookID { get; set; }

        // Navigation
        public User User { get; set; }
        public Book Book { get; set; }
    }
}
