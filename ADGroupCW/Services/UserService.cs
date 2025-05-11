using ADGroupCW.Dtos;
using Microsoft.AspNetCore.Identity;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UserService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<List<UserViewDto>> GetAllUsersAsync()
    {
        var users = _userManager.Users.ToList();
        var userList = new List<UserViewDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new UserViewDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                MembershipId = user.MembershipId,
                EmailConfirmed = user.EmailConfirmed,
                Roles = roles.ToList()
            });
        }

        return userList;
    }

    public async Task<object> ConfirmEmailAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return new { success = false, message = "User not found." };

        user.EmailConfirmed = !user.EmailConfirmed;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return new { success = false, message = "Failed to update email status." };

        return new
        {
            success = true,
            message = user.EmailConfirmed ? "Email verified." : "Email unverified.",
            status = user.EmailConfirmed
        };
    }


    public async Task<bool> ChangeUserRoleAsync(string userId, string newRole)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded) return false;

        var addResult = await _userManager.AddToRoleAsync(user, newRole);
        return addResult.Succeeded;
    }


    public async Task<UserViewDto> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new UserViewDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            MembershipId = user.MembershipId,
            Roles = roles.ToList()
        };
    }


    public async Task<UserViewDto> GetCurrentUserProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new UserViewDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            MembershipId = user.MembershipId,
            Roles = roles.ToList()
        };
    }


}
