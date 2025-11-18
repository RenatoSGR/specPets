using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class AvailabilityRepository : IAvailabilityRepository
{
    private readonly AppDbContext _context;

    public AvailabilityRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Availability?> GetByIdAsync(int id)
    {
        return await _context.Availabilities.FindAsync(id);
    }

    public async Task<IEnumerable<Availability>> GetBySitterIdAsync(int sitterId)
    {
        return await _context.Availabilities
            .Where(a => a.PetSitterId == sitterId)
            .OrderBy(a => a.StartDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Availability>> GetBySitterAndDateRangeAsync(int sitterId, DateTime startDate, DateTime endDate)
    {
        return await _context.Availabilities
            .Where(a => a.PetSitterId == sitterId && 
                       a.StartDate >= startDate && 
                       a.EndDate <= endDate)
            .OrderBy(a => a.StartDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Availability>> GetAllAsync()
    {
        return await _context.Availabilities.ToListAsync();
    }

    public async Task<Availability> CreateAsync(Availability availability)
    {
        _context.Availabilities.Add(availability);
        await _context.SaveChangesAsync();
        return availability;
    }

    public async Task<Availability> UpdateAsync(Availability availability)
    {
        _context.Availabilities.Update(availability);
        await _context.SaveChangesAsync();
        return availability;
    }

    public async Task DeleteAsync(int id)
    {
        var availability = await _context.Availabilities.FindAsync(id);
        if (availability != null)
        {
            _context.Availabilities.Remove(availability);
            await _context.SaveChangesAsync();
        }
    }
}
