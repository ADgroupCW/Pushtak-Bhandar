using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ADGroupCW.Models
{
    public class Format
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; // e.g., "Hardcover", "Deluxe", etc.

        public ICollection<BookFormat>? BookFormats { get; set; }
    }
}
