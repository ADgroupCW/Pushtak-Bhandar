namespace ADGroupCW.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }  // You’ll hash this later for security
        public string Role { get; set; }      // e.g., "Admin", "Member"

        // Navigation
        public ICollection<Order> Orders { get; set; }
        public ICollection<Bookmark> Bookmarks { get; set; }
    }
}
