namespace ADGroupCW.Models
{
    public class OrderItem
    {
        public int OrderItemID { get; set; }

        public int OrderID { get; set; }
        public int BookID { get; set; }
        public int Quantity { get; set; }

        // Navigation
        public Order Order { get; set; }
        public Book Book { get; set; }
    }
}
