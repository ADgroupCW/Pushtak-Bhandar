using ADGroupCW.Dtos;

public interface IUserService
{
    Task<List<UserViewDto>> GetAllUsersAsync();
    Task<object> ConfirmEmailAsync(string userId);
    Task<bool> ChangeUserRoleAsync(string userId, string newRole);

    Task<UserViewDto> GetUserByIdAsync(string userId);
    Task<UserViewDto> GetCurrentUserProfileAsync(string userId);

}
