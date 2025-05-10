using System.Collections.Generic;
using System.Threading.Tasks;
using ADGroupCW.Dtos;

namespace ADGroupCW.Services
{
    public interface ICartService
    {
        // 🟢 Add a book to the cart
        Task<bool> AddToCartAsync(string userId, int bookId, int quantity);

        // 🟡 Update the quantity of a cart item
        Task<bool> UpdateCartItemAsync(int cartItemId, int quantity);

        // 🔎 Get all cart items for a user
        Task<List<CartItemViewDto>> GetUserCartAsync(string userId);

        // 🔴 Remove a specific item from the cart
        Task<bool> RemoveCartItemAsync(int cartItemId);

        // 🚮 Clear entire cart (optional, used after order)
        Task<bool> ClearCartAsync(string userId);
    }
}
