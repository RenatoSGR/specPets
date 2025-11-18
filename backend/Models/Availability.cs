namespace Backend.Models;

public class Availability
{
    public int Id { get; set; }
    public int PetSitterId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsAvailable { get; set; }
    
    // Navigation properties
    public PetSitter PetSitter { get; set; } = null!;
}
