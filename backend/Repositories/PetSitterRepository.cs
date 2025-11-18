using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class PetSitterRepository : IPetSitterRepository
{
    private readonly AppDbContext _context;

    public PetSitterRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PetSitter?> GetByIdAsync(int id)
    {
        return await _context.PetSitters
            .Include(ps => ps.Services)
            .Include(ps => ps.Availabilities)
            .Include(ps => ps.ReviewsReceived)
            .FirstOrDefaultAsync(ps => ps.Id == id);
    }

    public async Task<PetSitter?> GetByEmailAsync(string email)
    {
        return await _context.PetSitters
            .Include(ps => ps.Services)
            .FirstOrDefaultAsync(ps => ps.Email == email);
    }

    public async Task<IEnumerable<PetSitter>> GetAllAsync()
    {
        return await _context.PetSitters
            .Include(ps => ps.Services)
            .Include(ps => ps.ReviewsReceived)
            .ToListAsync();
    }

    public async Task<IEnumerable<PetSitter>> SearchAsync(string? zipCode, DateTime? startDate, DateTime? endDate)
    {
        var query = _context.PetSitters
            .Include(ps => ps.Services)
            .Include(ps => ps.Availabilities)
            .Include(ps => ps.ReviewsReceived)
            .AsQueryable();

        if (!string.IsNullOrEmpty(zipCode))
        {
            query = query.Where(ps => ps.ZipCode == zipCode);
        }

        if (startDate.HasValue && endDate.HasValue)
        {
            query = query.Where(ps => ps.Availabilities.Any(a => 
                a.IsAvailable && 
                a.StartDate >= startDate.Value && 
                a.EndDate <= endDate.Value));
        }

        return await query.ToListAsync();
    }

    public async Task<PetSitter> CreateAsync(PetSitter petSitter)
    {
        _context.PetSitters.Add(petSitter);
        await _context.SaveChangesAsync();
        return petSitter;
    }

    public async Task<PetSitter> UpdateAsync(PetSitter petSitter)
    {
        _context.PetSitters.Update(petSitter);
        await _context.SaveChangesAsync();
        return petSitter;
    }

    public async Task DeleteAsync(int id)
    {
        var petSitter = await _context.PetSitters.FindAsync(id);
        if (petSitter != null)
        {
            _context.PetSitters.Remove(petSitter);
            await _context.SaveChangesAsync();
        }
    }
}
