using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementService _service;

    public AnnouncementController(IAnnouncementService service)
    {
        _service = service;
    }

    // ➕ Add announcement
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ServiceAnnouncementDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // 👀 Get all announcements (admin)
    [HttpGet("admin")]
    public async Task<ActionResult<List<ServiceAnnouncement>>> GetAllAdmin()
    {
        var announcements = await _service.GetAllAdminAsync();
        return Ok(announcements);
    }

    // 👀 Get public announcements (user)
    [HttpGet("public")]
    public async Task<ActionResult<List<ServiceAnnouncement>>> GetPublic()
    {
        var announcements = await _service.GetPublicAsync();
        return Ok(announcements);
    }

    // 📝 Update announcement
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ServiceAnnouncementDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _service.UpdateAsync(id, dto);
        if (updated == null) return NotFound();

        return Ok(updated);
    }

    // ❌ Delete announcement
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }

    // 🔍 Optional: Get by ID (used in Create's CreatedAtAction)
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceAnnouncement>> GetById(int id)
    {
        var all = await _service.GetAllAdminAsync();
        var announcement = all.Find(a => a.Id == id);
        return announcement == null ? NotFound() : Ok(announcement);
    }
}
