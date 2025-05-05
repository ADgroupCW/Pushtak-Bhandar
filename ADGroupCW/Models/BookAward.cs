namespace ADGroupCW.Models
{
    public class BookAward
    {
        public int BookId { get; set; }
        public Book Book { get; set; } = null!;

        public int AwardId { get; set; }
        public Award Award { get; set; } = null!;
    }
}
