using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(int id);
    Task<IEnumerable<Booking>> GetAllAsync();
    Task<IEnumerable<Booking>> GetByOwnerIdAsync(int ownerId);
    Task<IEnumerable<Booking>> GetBySitterIdAsync(int sitterId);
    Task<IEnumerable<Booking>> GetPendingBySitterIdAsync(int sitterId);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateAsync(Booking booking);
    Task DeleteAsync(int id);
}
