namespace ADGroupCW.Dtos
{
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int TotalBooks { get; set; }
        public int TotalOrders { get; set; }
        public int ActiveOrders { get; set; }
        public int TotalReviews { get; set; }
        public string TopRatedBook { get; set; }
        public double TopRatedBookAverage { get; set; }
    }
}
