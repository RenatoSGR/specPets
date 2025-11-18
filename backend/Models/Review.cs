namespace Backend.Models;

/// <summary>
/// Review Model
/// Represents a review left by a pet owner for a pet sitter
/// </summary>
public class Review
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int OwnerId { get; set; }
    public PetOwner Owner { get; set; } = null!;
    public int SitterId { get; set; }
    public PetSitter Sitter { get; set; } = null!;
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
