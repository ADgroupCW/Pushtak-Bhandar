namespace ADGroupCW.Dtos
{
    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Language { get; set; } = "English";
        public DateTime PublicationDate { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public bool IsAvailableInStore { get; set; }
        public bool IsOnSale { get; set; }
        public DateTime? SaleStartDate { get; set; }
        public DateTime? SaleEndDate { get; set; }
        public int StockCount { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        public string GenreName { get; set; } = string.Empty;
        public string PublisherName { get; set; } = string.Empty;

        public List<string>? BookAwardNames { get; set; }
        public List<string>? BookFormatNames { get; set; }
    }
}
