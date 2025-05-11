using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;


namespace ADGroupCW.Services
{
    public class AdminOrderService : IAdminOrderService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public AdminOrderService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<AdminOrderDetailDto> GetOrderByIdAsync(int orderId)
        {
            var order = await _context.Orders
                
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return null;

            return new AdminOrderDetailDto
            {
                OrderId = order.Id,
                UserEmail = await _context.Users
                            .Where(u => u.Id == order.UserId)
                            .Select(u => u.Email)
                            .FirstOrDefaultAsync(),
                ClaimCode = order.ClaimCode,
                OrderedAt = order.OrderedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                Items = order.Items.Select(i => new OrderItemViewDto
                {
                    BookId = i.BookId,
                    Title = i.Book?.Title,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };
        }


        public async Task<bool> UpdateOrderStatusAsync(UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

            if (order == null) return false;

            var oldStatus = order.Status;
            if (dto.NewStatus == "Completed" && order.Status != "Completed")
            {
                var orderItems = await _context.OrderItems
                    .Where(i => i.OrderId == order.Id)
                    .ToListAsync();

                foreach (var item in orderItems)
                {
                    var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == item.BookId);
                    if (book != null)
                    {
                        book.SoldCount += item.Quantity;
                    }
                }
            }

            order.Status = dto.NewStatus;
            _context.Orders.Update(order);

            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                var userEmail = await _context.Users
                    .Where(u => u.Id == order.UserId)
                    .Select(u => u.Email)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(userEmail))
                {
                    var subject = $"Order #{order.Id} Status Updated to {dto.NewStatus}";
                    var body = $@"
            <div style='font-family:Segoe UI, sans-serif; font-size:14px; line-height:1.6; color:#333;'>
              <h2>Order Status Update</h2>
              <p>Your order with <strong>Claim Code:</strong> {order.ClaimCode} has been updated.</p>
              <p><strong>Previous Status:</strong> {oldStatus}<br/>
              <strong>New Status:</strong> <span style='color:#007BFF'>{dto.NewStatus}</span></p>
              <p>You can visit the app to track your order progress.</p>
              <br/>
              <p>Thank you,<br/><strong>Pushtak Vandar</strong></p>
            </div>";
                    await _emailService.SendEmailAsync(userEmail, subject, body);
                }
            }

            return result;
        }


        public async Task<List<AdminOrderDetailDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.OrderedAt)
                .ToListAsync();

            // manually get all user emails by UserId
            var userIds = orders.Select(o => o.UserId).Distinct().ToList();
            var userEmails = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            return orders.Select(order => new AdminOrderDetailDto
            {
                OrderId = order.Id,
                UserEmail = userEmails.TryGetValue(order.UserId, out var email) ? email : "Unknown",
                ClaimCode = order.ClaimCode,
                OrderedAt = order.OrderedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status
            }).ToList();
        }

    }

}
