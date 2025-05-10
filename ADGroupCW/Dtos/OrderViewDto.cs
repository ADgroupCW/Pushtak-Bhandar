namespace ADGroupCW.Dtos
{
    public class OrderViewDto
    {
        public int OrderId { get; set; }
        public string ClaimCode { get; set; }
        public DateTime OrderedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public List<OrderItemViewDto> Items { get; set; }
    }

}
