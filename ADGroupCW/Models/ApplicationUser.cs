using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    public string MembershipId { get; set; } // custom field
}
