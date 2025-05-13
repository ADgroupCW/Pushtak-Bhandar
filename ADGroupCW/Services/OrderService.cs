using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using ADGroupCW.Services.Interface;
using System.Net;

namespace ADGroupCW.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IEmailService _emailService;

        public OrderService(AppDbContext context, IWebHostEnvironment env, IEmailService emailService)
        {
            _context = context;
            _env = env;
            _emailService = emailService;
        }

        public async Task<OrderViewDto> PlaceOrderAsync(string userId, List<int> cartItemIds)
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Book)
                .Where(ci => cartItemIds.Contains(ci.Id) && ci.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any()) return null;

            int pastOrdersCount = await _context.Orders
                .CountAsync(o => o.UserId == userId && o.Status == "Completed");

            // ✅ Calculate subtotal with proper price logic (sale or original)
            decimal subtotal = cartItems.Sum(ci =>
            {
                var price = (ci.Book.IsOnSale ? ci.Book.Price : ci.Book.OriginalPrice) ?? 0m;
                return price * ci.Quantity;
            });


            int bookCount = cartItems.Sum(ci => ci.Quantity);

            decimal discount = 0;
            if (bookCount >= 5) discount += subtotal * 0.05m;
            if (pastOrdersCount >= 10) discount += subtotal * 0.10m;

            decimal total = subtotal - discount;

            // ✅ Create order with correct price per item
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
                    UnitPrice = (ci.Book.IsOnSale ? ci.Book.Price : ci.Book.OriginalPrice) ?? 0m
                }).ToList()
            };

            // 🔻 Decrease book stock
            foreach (var ci in cartItems)
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == ci.BookId);
                if (book != null)
                {
                    if (book.StockCount < ci.Quantity)
                        throw new InvalidOperationException($"Not enough stock for '{book.Title}'");

                    book.StockCount -= ci.Quantity;
                }
            }

            await _context.Orders.AddAsync(order);
            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            // ✅ Send Order Placed Email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                var subject = "Your Order Has Been Placed!";
                var body = BuildEmailBody(order, cartItems, subtotal, discount, total);
                await _emailService.SendEmailAsync(user.Email, subject, body);
            }

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
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId && o.Status == "Pending");

            if (order == null) return false;

            // 🔼 Restore stock
            foreach (var item in order.Items)
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == item.BookId);
                if (book != null)
                {
                    book.StockCount += item.Quantity;
                }
            }

            order.Status = "Cancelled";
            _context.Orders.Update(order);

            var result = await _context.SaveChangesAsync() > 0;

            // 📧 Send Order Cancelled Email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (result && user != null && !string.IsNullOrEmpty(user.Email))
            {
                var subject = "Your Order Has Been Cancelled";
                var body = $@"
                <div style='font-family:Segoe UI, sans-serif; color:#333; font-size:14px; line-height:1.6;'>
                    <h2 style='color:#c0392b;'>Order Cancelled</h2>
                    <p>Your order with claim code <strong>{order.ClaimCode}</strong> has been successfully cancelled.</p>
                    <p>Any reserved stock has been released back into inventory.</p>
                    <p>If this was a mistake, you can place a new order anytime.</p>
                    <p>Thank you for using <strong>Pushtak Vandar</strong>.</p>
                </div>";
                await _emailService.SendEmailAsync(user.Email, subject, body);
            }

            return result;
        }

        private string GenerateClaimCode()
        {
            return $"CLAIM-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }

        private string BuildEmailBody(Order order, List<CartItem> items, decimal subtotal, decimal discount, decimal total)
        {
            var itemList = string.Join("", items.Select(i =>
            {
                var price = i.Book.IsOnSale ? i.Book.Price : i.Book.OriginalPrice;
                return $"<li>{WebUtility.HtmlEncode(i.Book.Title)} × {i.Quantity} — {price:C} each</li>";
            }));

            return $@"
            <div style='font-family:Segoe UI, sans-serif; color:#333; font-size:14px; line-height:1.6;'>
              <h2 style='color:#444;'>Order Confirmation</h2>
              <p><strong>Claim Code:</strong> {order.ClaimCode}</p>
              <p><strong>Order Date:</strong> {order.OrderedAt:MMMM dd, yyyy HH:mm}</p>
              <p><strong>Subtotal:</strong> {subtotal:C}</p>
              <p><strong>Discount Applied:</strong> {discount:C}</p>
              <p><strong>Total Amount:</strong> <span style='color:#007BFF; font-weight:bold'>{total:C}</span></p>
              <h3 style='margin-top:20px;'>Items:</h3>
              <ul style='padding-left:20px;'>{itemList}</ul>
              <p style='margin-top:30px;'>Please present this claim code during pickup.<br/>Thank you for shopping with <strong>Pushtak Vandar</strong>!</p>
            </div>";
        }
    }
}
