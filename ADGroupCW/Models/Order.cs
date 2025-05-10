namespace ADGroupCW.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string ClaimCode { get; set; }
        public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; // or "Cancelled", "Completed"

        public ICollection<OrderItem> Items { get; set; }
    }
}
