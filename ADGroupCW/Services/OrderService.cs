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
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public OrderService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<OrderViewDto> PlaceOrderAsync(string userId, List<int> cartItemIds)
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Book)
                .Where(ci => cartItemIds.Contains(ci.Id) && ci.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any()) return null;

            // Calculate total
            decimal subtotal = cartItems.Sum(ci => ci.Book.Price * ci.Quantity);
            int bookCount = cartItems.Sum(ci => ci.Quantity);
            decimal discount = 0;

            if (bookCount >= 5)
                discount = subtotal * 0.05m;

            decimal total = subtotal - discount;

            var order = new Order
            {
                UserId = userId,
                OrderedAt = DateTime.UtcNow,
                Status = "Pending",
                ClaimCode = GenerateClaimCode(),
                TotalAmount = total,
                Items = cartItems.Select(ci => new OrderItem
                {
                    BookId = ci.BookId,
                    Quantity = ci.Quantity,
                    UnitPrice = ci.Book.Price
                }).ToList()
            };

            await _context.Orders.AddAsync(order);

            // Remove purchased items from cart
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            return new OrderViewDto
            {
                OrderId = order.Id,
                ClaimCode = order.ClaimCode,
                OrderedAt = order.OrderedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                Items = order.Items.Select(i => new OrderItemViewDto
                {
                    BookId = i.BookId,
                    Title = _context.Books.FirstOrDefault(b => b.Id == i.BookId)?.Title,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };
        }

        public async Task<List<OrderViewDto>> GetUserOrdersAsync(string userId)
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderedAt)
                .ToListAsync();

            return orders.Select(o => new OrderViewDto
            {
                OrderId = o.Id,
                ClaimCode = o.ClaimCode,
                OrderedAt = o.OrderedAt,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                Items = o.Items.Select(i => new OrderItemViewDto
                {
                    BookId = i.BookId,
                    Title = _context.Books.FirstOrDefault(b => b.Id == i.BookId)?.Title,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            }).ToList();
        }

        public async Task<bool> CancelOrderAsync(string userId, int orderId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId && o.Status == "Pending");

            if (order == null) return false;

            order.Status = "Cancelled";
            _context.Orders.Update(order);
            return await _context.SaveChangesAsync() > 0;
        }

        private string GenerateClaimCode()
        {
            return $"CLAIM-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }
    }
}
