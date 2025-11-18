using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _context;

    public BookingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(int id)
    {
        return await _context.Bookings
            .Include(b => b.PetOwner)
            .Include(b => b.PetSitter)
            .Include(b => b.Service)
            .Include(b => b.Messages)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Booking>> GetAllAsync()
    {
        return await _context.Bookings
            .Include(b => b.PetOwner)
            .Include(b => b.PetSitter)
            .Include(b => b.Service)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByOwnerIdAsync(int ownerId)
    {
        return await _context.Bookings
            .Include(b => b.PetSitter)
            .Include(b => b.Service)
            .Where(b => b.PetOwnerId == ownerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetBySitterIdAsync(int sitterId)
    {
        return await _context.Bookings
            .Include(b => b.PetOwner)
            .Include(b => b.Service)
            .Where(b => b.PetSitterId == sitterId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetPendingBySitterIdAsync(int sitterId)
    {
        return await _context.Bookings
            .Include(b => b.PetOwner)
            .Include(b => b.Service)
            .Where(b => b.PetSitterId == sitterId && b.Status == BookingStatus.Pending)
            .OrderBy(b => b.StartDate)
            .ToListAsync();
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking> UpdateAsync(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task DeleteAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
        }
    }
}
