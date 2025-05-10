using System.Collections.Generic;
using System.Threading.Tasks;
using ADGroupCW.Dtos;

namespace ADGroupCW.Services
{
    public interface IOrderService
    {
        // Place an order from the user's cart
        Task<OrderViewDto> PlaceOrderAsync(string userId, List<int> cartItemIds);

        // Get all orders for a user
        Task<List<OrderViewDto>> GetUserOrdersAsync(string userId);

        // Cancel a specific order (must be Pending)
        Task<bool> CancelOrderAsync(string userId, int orderId);
    }
}
