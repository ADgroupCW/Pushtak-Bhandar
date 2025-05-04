using ADGroupCW.Models;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            var newUser = await _userService.RegisterUserAsync(user);
            return Ok(newUser);
        }
    }
}
