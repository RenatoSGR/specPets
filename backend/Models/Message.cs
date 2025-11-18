namespace Backend.Models;

public class Message
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int SenderId { get; set; }
    public string SenderType { get; set; } = string.Empty; // "Owner" or "Sitter"
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    
    // Navigation properties
    public Booking Booking { get; set; } = null!;
}
