using ADGroupCW.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")] // ✅ Restrict all endpoints to Admins only
public class AdminUserController : ControllerBase
{
    private readonly IUserService _userService;

    public AdminUserController(IUserService userService)
    {
        _userService = userService;
    }

    // ✅ Get all users
    [HttpGet]
    public async Task<ActionResult<List<UserViewDto>>> GetUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    // ✅ Confirm email
    [HttpPut("{id}/confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string id)
    {
        dynamic result = await _userService.ConfirmEmailAsync(id);

        if (result.success == false)
            return NotFound(result);

        return Ok(result);
    }

    // ✅ Change user role
    [HttpPut("{id}/change-role")]
    public async Task<IActionResult> ChangeRole(string id, [FromBody] ChangeUserRoleDto dto)
    {
        var result = await _userService.ChangeUserRoleAsync(id, dto.NewRole);
        if (!result) return BadRequest(new { error = "Role change failed" });
        return Ok(new { message = "Role updated" });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserViewDto>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound("User not found.");
        return Ok(user);
    }
}
