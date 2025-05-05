
﻿namespace ADGroupCW.Dtos

{
    public class BookFilterDto
    {
        public int? GenreId { get; set; }
        public bool? IsOnSale { get; set; }
        public string? Language { get; set; }  // ✅ Add this line
        public DateTime? PublicationFrom { get; set; }
        public DateTime? PublicationTo { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }

}

