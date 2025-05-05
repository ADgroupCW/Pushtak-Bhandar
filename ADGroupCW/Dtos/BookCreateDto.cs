namespace ADGroupCW.Dtos
{
    public class BookCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Language { get; set; } = "English";
        public DateTime PublicationDate { get; set; }
        public decimal Price { get; set; }

        // ✅ Add the missing properties
        public decimal? OriginalPrice { get; set; }
        public bool IsAvailableInStore { get; set; } = true;
        public bool IsOnSale { get; set; }
        public DateTime? SaleStartDate { get; set; }
        public DateTime? SaleEndDate { get; set; }

        public int StockCount { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int GenreId { get; set; }
        public int PublisherId { get; set; }

        // Add awards and formats if you're accepting them during create
        public List<int>? AwardIds { get; set; }
        public List<int>? FormatIds { get; set; }
    }

}