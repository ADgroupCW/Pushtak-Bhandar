using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ADGroupCW.Services;
using ADGroupCW.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;

namespace ADGroupCW.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/order")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // 🛒 Place order from cart
        [HttpPost]
        public async Task<ActionResult<OrderViewDto>> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user.");

            var order = await _orderService.PlaceOrderAsync(userId, dto.CartItemIds);
            return order == null ? BadRequest("Failed to place order.") : Ok(order);
        }

        // 📄 Get current user's order history
        [HttpGet("my-orders")]
        public async Task<ActionResult<List<OrderViewDto>>> GetOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user.");

            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }

        // ❌ Cancel order
        [HttpPut("{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user.");

            var result = await _orderService.CancelOrderAsync(userId, orderId);
            return result ? Ok(new { message = "Order cancelled." }) : NotFound("Cannot cancel this order.");
        }
    }
}
