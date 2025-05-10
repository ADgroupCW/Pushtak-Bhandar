using System.Collections.Generic;
using System.Threading.Tasks;
using ADGroupCW.Dtos;

namespace ADGroupCW.Services
{
    public interface IBookmarkService
    {
        // Add a book to the user's bookmark list
        Task<bool> AddBookmarkAsync(string userId, int bookId);

        // Get all bookmarks for a user
        Task<List<BookmarkViewDto>> GetUserBookmarksAsync(string userId);

        // Remove a bookmark by its ID
        Task<bool> RemoveBookmarkAsync(int bookmarkId);
    }
}
