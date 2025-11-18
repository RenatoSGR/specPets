using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(string id)
    {
        return await _context.Reviews
            .Include(r => r.Owner)
            .Include(r => r.Sitter)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Review>> GetBySitterIdAsync(int sitterId, int skip = 0, int take = 10)
    {
        return await _context.Reviews
            .Include(r => r.Owner)
            .Where(r => r.SitterId == sitterId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<Review?> GetByBookingIdAsync(int bookingId)
    {
        return await _context.Reviews
            .Include(r => r.Owner)
            .Include(r => r.Sitter)
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);
    }

    public async Task<IEnumerable<Review>> GetAllAsync()
    {
        return await _context.Reviews
            .Include(r => r.Owner)
            .Include(r => r.Sitter)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<Review> UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return false;

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<double> GetAverageRatingAsync(int sitterId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.SitterId == sitterId)
            .ToListAsync();

        if (!reviews.Any()) return 0;

        return Math.Round(reviews.Average(r => r.Rating), 1);
    }

    public async Task<int> GetReviewCountAsync(int sitterId)
    {
        return await _context.Reviews
            .Where(r => r.SitterId == sitterId)
            .CountAsync();
    }

    public async Task<bool> HasReviewedBookingAsync(int bookingId)
    {
        return await _context.Reviews
            .AnyAsync(r => r.BookingId == bookingId);
    }
}
