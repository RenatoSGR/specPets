using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IAvailabilityRepository
{
    Task<Availability?> GetByIdAsync(int id);
    Task<IEnumerable<Availability>> GetBySitterIdAsync(int sitterId);
    Task<IEnumerable<Availability>> GetBySitterAndDateRangeAsync(int sitterId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<Availability>> GetAllAsync();
    Task<Availability> CreateAsync(Availability availability);
    Task<Availability> UpdateAsync(Availability availability);
    Task DeleteAsync(int id);
}
