﻿namespace ADGroupCW.Dtos
{
    public class OrderItemViewDto
    {
        public int BookId { get; set; }
        public string Title { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

}
