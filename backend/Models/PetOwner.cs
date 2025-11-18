namespace Backend.Models;

public class PetOwner
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public List<Pet> Pets { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    public List<Review> ReviewsWritten { get; set; } = new();
}
