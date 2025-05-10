using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace ADGroupCW.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CartService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<bool> AddToCartAsync(string userId, int bookId, int quantity)
        {
            var existing = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId);

            if (existing != null)
            {
                existing.Quantity += quantity;
                _context.CartItems.Update(existing);
            }
            else
            {
                var newItem = new CartItem
                {
                    UserId = userId,
                    BookId = bookId,
                    Quantity = quantity,
                    AddedAt = DateTime.UtcNow
                };
                await _context.CartItems.AddAsync(newItem);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateCartItemAsync(int cartItemId, int quantity)
        {
            var item = await _context.CartItems.FindAsync(cartItemId);
            if (item == null) return false;

            item.Quantity = quantity;
            _context.CartItems.Update(item);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<CartItemViewDto>> GetUserCartAsync(string userId)
        {
            var items = await _context.CartItems
                .Include(ci => ci.Book)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            return items.Select(ci => new CartItemViewDto
            {
                Id = ci.Id,
                BookId = ci.BookId,
                Title = ci.Book.Title,
                UnitPrice = ci.Book.Price,
                Quantity = ci.Quantity
            }).ToList();
        }

        public async Task<bool> RemoveCartItemAsync(int cartItemId)
        {
            var item = await _context.CartItems.FindAsync(cartItemId);
            if (item == null) return false;

            _context.CartItems.Remove(item);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ClearCartAsync(string userId)
        {
            var items = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(items);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
