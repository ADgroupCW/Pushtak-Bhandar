namespace ADGroupCW.Dtos
{
    public class MonthlyOrderDto
    {
        public string Month { get; set; }
        public int OrderCount { get; set; }
    }

    public class RatingBreakdownDto
    {
        public int Rating { get; set; }
        public int Count { get; set; }
    }

    public class TopReviewedBookDto
    {
        public string Title { get; set; }
        public int ReviewCount { get; set; }
    }

    public class UserRegistrationDto
    {
        public string Month { get; set; }
        public int UserCount { get; set; }
    }

}
