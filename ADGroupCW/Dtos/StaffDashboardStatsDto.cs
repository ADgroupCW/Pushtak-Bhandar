namespace ADGroupCW.Dtos
{
    public class StaffDashboardStatsDto
    {
        public int PendingOrdersCount { get; set; }
        public int CompletedOrdersCount { get; set; }
        public int TotalBooksHandled { get; set; }
        public decimal TotalRevenue { get; set; }
    }

}
