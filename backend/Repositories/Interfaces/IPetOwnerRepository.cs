using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IPetOwnerRepository
{
    Task<PetOwner?> GetByIdAsync(int id);
    Task<PetOwner?> GetByEmailAsync(string email);
    Task<IEnumerable<PetOwner>> GetAllAsync();
    Task<PetOwner> CreateAsync(PetOwner petOwner);
    Task<PetOwner> UpdateAsync(PetOwner petOwner);
    Task DeleteAsync(int id);
}
