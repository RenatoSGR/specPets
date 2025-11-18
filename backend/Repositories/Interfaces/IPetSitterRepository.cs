using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IPetSitterRepository
{
    Task<PetSitter?> GetByIdAsync(int id);
    Task<PetSitter?> GetByEmailAsync(string email);
    Task<IEnumerable<PetSitter>> GetAllAsync();
    Task<IEnumerable<PetSitter>> SearchAsync(string? zipCode, DateTime? startDate, DateTime? endDate);
    Task<PetSitter> CreateAsync(PetSitter petSitter);
    Task<PetSitter> UpdateAsync(PetSitter petSitter);
    Task DeleteAsync(int id);
}
