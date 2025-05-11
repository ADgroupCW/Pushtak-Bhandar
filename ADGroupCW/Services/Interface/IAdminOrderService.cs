using ADGroupCW.Dtos;

namespace ADGroupCW.Services.Interface
{
    public interface IAdminOrderService
    {
        Task<AdminOrderDetailDto> GetOrderByIdAsync(int orderId);
        Task<bool> UpdateOrderStatusAsync(UpdateOrderStatusDto dto);

        Task<List<AdminOrderDetailDto>> GetAllOrdersAsync();

    }

}
