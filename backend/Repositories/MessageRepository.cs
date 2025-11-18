using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly AppDbContext _context;

    public MessageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Message?> GetByIdAsync(int id)
    {
        return await _context.Messages
            .Include(m => m.Booking)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Message>> GetByBookingIdAsync(int bookingId)
    {
        return await _context.Messages
            .Where(m => m.BookingId == bookingId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetUnreadByUserAsync(int userId, string userType)
    {
        return await _context.Messages
            .Include(m => m.Booking)
            .Where(m => !m.IsRead && 
                       ((userType == "Owner" && m.Booking.PetOwnerId == userId) ||
                        (userType == "Sitter" && m.Booking.PetSitterId == userId)))
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId, string userType)
    {
        return await _context.Messages
            .Include(m => m.Booking)
            .Where(m => !m.IsRead && 
                       ((userType == "Owner" && m.Booking.PetOwnerId == userId) ||
                        (userType == "Sitter" && m.Booking.PetSitterId == userId)))
            .CountAsync();
    }

    public async Task<IEnumerable<Message>> GetAllAsync()
    {
        return await _context.Messages
            .Include(m => m.Booking)
            .ToListAsync();
    }

    public async Task<Message> CreateAsync(Message message)
    {
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<Message> UpdateAsync(Message message)
    {
        _context.Messages.Update(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task DeleteAsync(int id)
    {
        var message = await _context.Messages.FindAsync(id);
        if (message != null)
        {
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
        }
    }
}
