using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;


namespace ADGroupCW.Services
{
    public class StaffOrderService : IStaffOrderService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public StaffOrderService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<ClaimedOrderViewDto> VerifyClaimCodeAsync(string claimCode)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

            if (order == null) return null;

            return new ClaimedOrderViewDto
            {
                OrderId = order.Id,
                ClaimCode = order.ClaimCode,
                OrderedAt = order.OrderedAt,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Items = order.Items.Select(i => new OrderItemViewDto
                {
                    BookId = i.BookId,
                    Title = i.Book?.Title,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };
        }

        public async Task<bool> UpdateOrderStatusByClaimCodeAsync(StaffUpdateStatusDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.ClaimCode == dto.ClaimCode);
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
                var email = await _context.Users
                    .Where(u => u.Id == order.UserId)
                    .Select(u => u.Email)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(email))
                {
                    var subject = $"Order Status Updated by Staff";
                    var body = $@"
                <div style='font-family:Segoe UI, sans-serif; font-size:14px; line-height:1.6; color:#333;'>
                    <h2>Order Update</h2>
                    <p>Your order with Claim Code: <strong>{dto.ClaimCode}</strong> has been updated by staff.</p>
                    <p><strong>Previous Status:</strong> {oldStatus}<br/>
                    <strong>New Status:</strong> <span style='color:#007BFF'>{dto.NewStatus}</span></p>
                    <br/>
                    <p>Thank you for choosing <strong>Pushtak Vandar</strong>.</p>
                </div>";
                    await _emailService.SendEmailAsync(email, subject, body);
                }
            }

            return result;
        }

        public async Task<StaffDashboardStatsDto> GetDashboardStatsAsync()
        {
            var completedOrders = await _context.Orders
                .Where(o => o.Status == "Completed")
                .Include(o => o.Items)
                .ToListAsync();

            int totalBooks = completedOrders.Sum(o => o.Items.Sum(i => i.Quantity));
            decimal totalRevenue = completedOrders.Sum(o => o.TotalAmount);

            return new StaffDashboardStatsDto
            {
                PendingOrdersCount = await _context.Orders.CountAsync(o => o.Status == "Pending"),
                CompletedOrdersCount = completedOrders.Count,
                TotalBooksHandled = totalBooks,
                TotalRevenue = totalRevenue
            };
        }


        public async Task<List<AdminOrderDetailDto>> GetCompletedOrdersAsync()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == "Completed")
                .Include(o => o.Items)
                .OrderByDescending(o => o.OrderedAt)
                .ToListAsync();

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
