using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IServiceRepository
{
    Task<Service?> GetByIdAsync(int id);
    Task<IEnumerable<Service>> GetBySitterIdAsync(int sitterId);
    Task<IEnumerable<Service>> GetAllAsync();
    Task<Service> CreateAsync(Service service);
    Task<Service> UpdateAsync(Service service);
    Task DeleteAsync(int id);
}
