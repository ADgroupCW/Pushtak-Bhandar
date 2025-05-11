using ADGroupCW.Dtos;

namespace ADGroupCW.Services.Interface
{
    public interface IAnnouncementService
    {
        Task<ServiceAnnouncement> CreateAsync(ServiceAnnouncementDto dto);
        Task<List<ServiceAnnouncement>> GetAllAdminAsync();
        Task<List<ServiceAnnouncement>> GetPublicAsync();
        Task<ServiceAnnouncement?> UpdateAsync(int id, ServiceAnnouncementDto dto);
        Task<bool> DeleteAsync(int id);
    }

}
