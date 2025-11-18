namespace Backend.Models;

public class Booking
{
    public int Id { get; set; }
    public int PetOwnerId { get; set; }
    public int PetSitterId { get; set; }
    public int ServiceId { get; set; }
    public List<int> PetIds { get; set; } = new(); // Multiple pets can be included
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalCost { get; set; }
    public BookingStatus Status { get; set; }
    public string StatusReason { get; set; } = string.Empty; // For decline/cancel reasons
    public DateTime CreatedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    
    // Navigation properties
    public PetOwner PetOwner { get; set; } = null!;
    public PetSitter PetSitter { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public List<Message> Messages { get; set; } = new();
    public Review? Review { get; set; }
}

public enum BookingStatus
{
    Pending,
    Accepted,
    Declined,
    Completed,
    Cancelled
}
