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
    public class BookmarkService : IBookmarkService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BookmarkService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<bool> AddBookmarkAsync(string userId, int bookId)
        {
            // Prevent duplicate bookmarks
            bool exists = await _context.Bookmarks.AnyAsync(b =>
                b.UserId == userId && b.BookId == bookId);

            if (exists) return false;

            var bookmark = new Bookmark
            {
                UserId = userId,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Bookmarks.AddAsync(bookmark);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<BookmarkViewDto>> GetUserBookmarksAsync(string userId)
        {
            var bookmarks = await _context.Bookmarks
                .Include(b => b.Book)
                .Where(b => b.UserId == userId)
                .ToListAsync();

            return bookmarks.Select(b => new BookmarkViewDto
            {
                Id = b.Id,
                BookId = b.BookId,
                Title = b.Book.Title,
                CoverImageUrl = b.Book.ImageUrl
            }).ToList();
        }

        public async Task<bool> RemoveBookmarkAsync(int bookmarkId)
        {
            var bookmark = await _context.Bookmarks.FindAsync(bookmarkId);
            if (bookmark == null) return false;

            _context.Bookmarks.Remove(bookmark);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
