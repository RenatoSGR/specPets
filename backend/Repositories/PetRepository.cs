using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class PetRepository : IPetRepository
{
    private readonly AppDbContext _context;

    public PetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Pet?> GetByIdAsync(int id)
    {
        return await _context.Pets
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Pet>> GetByOwnerIdAsync(int ownerId)
    {
        return await _context.Pets
            .Where(p => p.PetOwnerId == ownerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Pet>> GetAllAsync()
    {
        return await _context.Pets
            .Include(p => p.Owner)
            .ToListAsync();
    }

    public async Task<Pet> CreateAsync(Pet pet)
    {
        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();
        return pet;
    }

    public async Task<Pet> UpdateAsync(Pet pet)
    {
        _context.Pets.Update(pet);
        await _context.SaveChangesAsync();
        return pet;
    }

    public async Task DeleteAsync(int id)
    {
        var pet = await _context.Pets.FindAsync(id);
        if (pet != null)
        {
            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();
        }
    }
}
