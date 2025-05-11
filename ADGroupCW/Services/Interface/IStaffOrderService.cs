using ADGroupCW.Dtos;

namespace ADGroupCW.Services.Interface
{
    public interface IStaffOrderService
    {
        Task<ClaimedOrderViewDto> VerifyClaimCodeAsync(string claimCode);
        Task<bool> UpdateOrderStatusByClaimCodeAsync(StaffUpdateStatusDto dto);
        Task<StaffDashboardStatsDto> GetDashboardStatsAsync();

        Task<List<AdminOrderDetailDto>> GetCompletedOrdersAsync();

    }

}
