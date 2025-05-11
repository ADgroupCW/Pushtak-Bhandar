namespace ADGroupCW.Dtos
{
    public class ServiceAnnouncementDto
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool ShowPublicly { get; set; }
    }

}
