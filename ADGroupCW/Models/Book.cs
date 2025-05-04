namespace ADGroupCW.Models
{
    public class Book
    {
        public int BookID { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Genre { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }

        // Navigation
        public ICollection<OrderItem> OrderItems { get; set; }
        public ICollection<Bookmark> Bookmarks { get; set; }
    }
}
