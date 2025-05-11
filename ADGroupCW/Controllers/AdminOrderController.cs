using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADGroupCW.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/orders")]
    public class AdminOrderController : ControllerBase
    {
        private readonly IAdminOrderService _adminOrderService;

        public AdminOrderController(IAdminOrderService adminOrderService)
        {
            _adminOrderService = adminOrderService;
        }

        [HttpGet("{orderId}")]
        public async Task<ActionResult<AdminOrderDetailDto>> GetOrder(int orderId)
        {
            var order = await _adminOrderService.GetOrderByIdAsync(orderId);
            if (order == null) return NotFound("Order not found.");
            return Ok(order);
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusDto dto)
        {
            var result = await _adminOrderService.UpdateOrderStatusAsync(dto);
            if (!result) return NotFound("Order not found or status update failed.");
            return Ok(new { message = "Order status updated successfully." });
        }

        [HttpGet]
        public async Task<ActionResult<List<AdminOrderDetailDto>>> GetAllOrders()
        {
            var orders = await _adminOrderService.GetAllOrdersAsync();
            return Ok(orders);
        }
    }


}
