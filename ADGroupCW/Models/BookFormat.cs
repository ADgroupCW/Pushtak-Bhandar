namespace ADGroupCW.Models
{
    public class BookFormat
    {
        public int BookId { get; set; }
        public Book Book { get; set; } = null!;

        public int FormatId { get; set; }
        public Format Format { get; set; } = null!;
    }
}
