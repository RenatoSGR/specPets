namespace Backend.Models;

public class Pet
{
    public int Id { get; set; }
    public int PetOwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Dog", "Cat", "Bird", etc.
    public string Breed { get; set; } = string.Empty;
    public int Age { get; set; }
    public string SpecialNeeds { get; set; } = string.Empty;
    public string BehavioralNotes { get; set; } = string.Empty;
    
    // Navigation properties
    public PetOwner Owner { get; set; } = null!;
}
