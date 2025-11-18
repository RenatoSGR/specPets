using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IPetRepository
{
    Task<Pet?> GetByIdAsync(int id);
    Task<IEnumerable<Pet>> GetByOwnerIdAsync(int ownerId);
    Task<IEnumerable<Pet>> GetAllAsync();
    Task<Pet> CreateAsync(Pet pet);
    Task<Pet> UpdateAsync(Pet pet);
    Task DeleteAsync(int id);
}
