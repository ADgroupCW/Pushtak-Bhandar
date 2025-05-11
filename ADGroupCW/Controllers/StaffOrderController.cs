using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [Authorize(Roles = "Staff")]
    [ApiController]
    [Route("api/staff/orders")]
    public class StaffOrderController : ControllerBase
    {
        private readonly IStaffOrderService _staffOrderService;

        public StaffOrderController(IStaffOrderService staffOrderService)
        {
            _staffOrderService = staffOrderService;
        }

        [HttpPost("verify")]
        public async Task<ActionResult<ClaimedOrderViewDto>> VerifyClaimCode([FromBody] ClaimCodeDto dto)
        {
            var order = await _staffOrderService.VerifyClaimCodeAsync(dto.ClaimCode);
            if (order == null) return NotFound("Invalid claim code.");
            return Ok(order);
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateOrderStatus([FromBody] StaffUpdateStatusDto dto)
        {
            var result = await _staffOrderService.UpdateOrderStatusByClaimCodeAsync(dto);
            if (!result) return NotFound("Order not found or status update failed.");
            return Ok(new { message = "Order status updated successfully." });
        }


        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _staffOrderService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedOrders()
        {
            var orders = await _staffOrderService.GetCompletedOrdersAsync();
            return Ok(orders);
        }

    }

}
