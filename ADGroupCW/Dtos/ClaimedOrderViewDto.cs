namespace ADGroupCW.Dtos
{
    public class ClaimedOrderViewDto
    {
        public int OrderId { get; set; }
        public string ClaimCode { get; set; }
        public string Status { get; set; }
        public DateTime OrderedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItemViewDto> Items { get; set; }
    }

}
