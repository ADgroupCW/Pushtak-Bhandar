using ADGroupCW.Data;
using ADGroupCW.Dtos;
using ADGroupCW.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace ADGroupCW.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly AppDbContext _context;

        public AnnouncementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceAnnouncement> CreateAsync(ServiceAnnouncementDto dto)
        {
            var entity = new ServiceAnnouncement
            {
                Title = dto.Title,
                Message = dto.Message,
                StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc),
                ShowPublicly = dto.ShowPublicly,
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceAnnouncements.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<List<ServiceAnnouncement>> GetAllAdminAsync()
        {
            return await _context.ServiceAnnouncements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<ServiceAnnouncement>> GetPublicAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.ServiceAnnouncements
                .Where(a => a.ShowPublicly && a.StartDate <= now && a.EndDate >= now)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();
        }

        public async Task<ServiceAnnouncement?> UpdateAsync(int id, ServiceAnnouncementDto dto)
        {
            var entity = await _context.ServiceAnnouncements.FindAsync(id);
            if (entity == null) return null;

            entity.Title = dto.Title;
            entity.Message = dto.Message;
            entity.StartDate = dto.StartDate;
            entity.EndDate = dto.EndDate;
            entity.ShowPublicly = dto.ShowPublicly;

            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.ServiceAnnouncements.FindAsync(id);
            if (entity == null) return false;

            _context.ServiceAnnouncements.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}
