using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ADGroupCW.Models
{
    public class Book
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;

        [Required]
        public string ISBN { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Language { get; set; } = "English";

        public DateTime PublicationDate { get; set; }

        public decimal Price { get; set; }

        public decimal? OriginalPrice { get; set; }

        public bool IsAvailableInStore { get; set; } = true;

        public bool IsOnSale { get; set; }

        public DateTime? SaleStartDate { get; set; }

        public DateTime? SaleEndDate { get; set; }

        public int StockCount { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public int SoldCount { get; set; } = 0;




        // Relationships
        public int GenreId { get; set; }
        public Genre? Genre { get; set; }

        public int PublisherId { get; set; }
        public Publisher? Publisher { get; set; }

        public ICollection<BookAward>? BookAwards { get; set; }
        public ICollection<BookFormat>? BookFormats { get; set; }
        public ICollection<Review>? Reviews { get; set; }
    }
}
