public class BookCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
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
    public IFormFile? ImageFile { get; set; }


    // Either GenreId or GenreName
    public int? GenreId { get; set; }
    public string? GenreName { get; set; }

    // Either PublisherId or PublisherName
    public int? PublisherId { get; set; }
    public string? PublisherName { get; set; }

    // Either BookAwardIds or BookAwardNames
    public List<int>? BookAwardIds { get; set; }
    public List<string>? BookAwardNames { get; set; }

    // Either BookFormatIds or BookFormatNames
    public List<int>? BookFormatIds { get; set; }
    public List<string>? BookFormatNames { get; set; }
}
