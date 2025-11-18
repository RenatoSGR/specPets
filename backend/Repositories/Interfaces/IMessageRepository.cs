using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IMessageRepository
{
    Task<Message?> GetByIdAsync(int id);
    Task<IEnumerable<Message>> GetByBookingIdAsync(int bookingId);
    Task<IEnumerable<Message>> GetUnreadByUserAsync(int userId, string userType);
    Task<int> GetUnreadCountAsync(int userId, string userType);
    Task<IEnumerable<Message>> GetAllAsync();
    Task<Message> CreateAsync(Message message);
    Task<Message> UpdateAsync(Message message);
    Task DeleteAsync(int id);
}
