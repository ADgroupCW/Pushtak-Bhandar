using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ADGroupCW.Services;
using ADGroupCW.Dtos;

namespace ADGroupCW.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddCartItemDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user.");

            var result = await _cartService.AddToCartAsync(userId, dto.BookId, dto.Quantity);
            return result ? Ok(new { message = "Added to cart" }) : BadRequest("Failed to add item.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] UpdateCartItemDto dto)
        {
            var result = await _cartService.UpdateCartItemAsync(id, dto.Quantity);
            return result ? Ok(new { message = "Quantity updated" }) : NotFound("Item not found.");
        }

        [HttpGet("my")]
        public async Task<ActionResult<List<CartItemViewDto>>> GetCart()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user.");

            var cart = await _cartService.GetUserCartAsync(userId);
            return Ok(cart);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveItem(int id)
        {
            var result = await _cartService.RemoveCartItemAsync(id);
            return result ? Ok(new { message = "Item removed" }) : NotFound("Item not found.");
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid user.");

            var result = await _cartService.ClearCartAsync(userId);
            return result ? Ok(new { message = "Cart cleared" }) : BadRequest("Failed to clear cart.");
        }
    }
}
