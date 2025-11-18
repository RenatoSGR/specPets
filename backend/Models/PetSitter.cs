namespace Backend.Models;

public class PetSitter
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal HourlyRate { get; set; }
    public List<string> Photos { get; set; } = new(); // URLs
    public List<string> PetTypesAccepted { get; set; } = new(); // e.g., "dog", "cat", "bird"
    public List<string> Skills { get; set; } = new(); // e.g., "grooming", "medication"
    public DateTime CreatedAt { get; set; }
    public int ProfileCompleteness { get; set; } // 0-100
    
    // Navigation properties
    public List<Service> Services { get; set; } = new();
    public List<Availability> Availabilities { get; set; } = new();
    public List<Booking> BookingsReceived { get; set; } = new();
    public List<Review> ReviewsReceived { get; set; } = new();
}
