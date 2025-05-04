namespace ADGroupCW.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int UserID { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } 

        // Navigation
        public User User { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }
    }
}
