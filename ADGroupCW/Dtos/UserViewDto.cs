namespace ADGroupCW.Dtos
{
    public class UserViewDto
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string MembershipId { get; set; }
        public bool EmailConfirmed { get; set; }
        public List<string> Roles { get; set; }
    }

}
