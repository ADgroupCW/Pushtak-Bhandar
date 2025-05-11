namespace ADGroupCW.Services.Interface
{
    public interface INewsletterService
    {
        Task<bool> SubscribeAsync(string email);
    }

}
