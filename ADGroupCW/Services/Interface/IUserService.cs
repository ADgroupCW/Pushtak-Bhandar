using ADGroupCW.Models;

namespace ADGroupCW.Services.Interface
{
    public interface IUserService
    {
        Task<List<User>> GetAllUsersAsync();
        Task<User> RegisterUserAsync(User user);
    }
}
