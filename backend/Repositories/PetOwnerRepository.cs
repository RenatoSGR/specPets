using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class PetOwnerRepository : IPetOwnerRepository
{
    private readonly AppDbContext _context;

    public PetOwnerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PetOwner?> GetByIdAsync(int id)
    {
        return await _context.PetOwners
            .Include(po => po.Pets)
            .Include(po => po.Bookings)
            .FirstOrDefaultAsync(po => po.Id == id);
    }

    public async Task<PetOwner?> GetByEmailAsync(string email)
    {
        return await _context.PetOwners
            .Include(po => po.Pets)
            .FirstOrDefaultAsync(po => po.Email == email);
    }

    public async Task<IEnumerable<PetOwner>> GetAllAsync()
    {
        return await _context.PetOwners
            .Include(po => po.Pets)
            .ToListAsync();
    }

    public async Task<PetOwner> CreateAsync(PetOwner petOwner)
    {
        _context.PetOwners.Add(petOwner);
        await _context.SaveChangesAsync();
        return petOwner;
    }

    public async Task<PetOwner> UpdateAsync(PetOwner petOwner)
    {
        _context.PetOwners.Update(petOwner);
        await _context.SaveChangesAsync();
        return petOwner;
    }

    public async Task DeleteAsync(int id)
    {
        var petOwner = await _context.PetOwners.FindAsync(id);
        if (petOwner != null)
        {
            _context.PetOwners.Remove(petOwner);
            await _context.SaveChangesAsync();
        }
    }
}
