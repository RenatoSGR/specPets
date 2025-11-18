using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(string id);
    Task<IEnumerable<Review>> GetBySitterIdAsync(int sitterId, int skip = 0, int take = 10);
    Task<Review?> GetByBookingIdAsync(int bookingId);
    Task<IEnumerable<Review>> GetAllAsync();
    Task<Review> CreateAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task<bool> DeleteAsync(string id);
    Task<double> GetAverageRatingAsync(int sitterId);
    Task<int> GetReviewCountAsync(int sitterId);
    Task<bool> HasReviewedBookingAsync(int bookingId);
}
