namespace Backend.Models;

public class Service
{
    public int Id { get; set; }
    public int PetSitterId { get; set; }
    public string Name { get; set; } = string.Empty; // e.g., "Overnight Care", "Daily Visit"
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string PriceUnit { get; set; } = string.Empty; // "per hour", "per day", "flat rate"
    public List<string> PetTypesSupported { get; set; } = new(); // e.g., ["dog", "cat"]
    
    // Navigation properties
    public PetSitter PetSitter { get; set; } = null!;
    public List<Booking> Bookings { get; set; } = new();
}
