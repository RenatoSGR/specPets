# Entity Framework Core Design Patterns for Pet Sitter Marketplace

**Research Date**: November 12, 2025  
**Target Framework**: .NET 9.0 / EF Core 9.0  
**Application**: Pet Sitter Marketplace Platform

## Executive Summary

This document provides comprehensive EF Core design patterns for a pet sitter marketplace with bidirectional relationships, location-based queries, and efficient data access patterns. The solution leverages .NET 9.0 and EF Core 9.0 features including complex types, improved many-to-many relationships, and advanced indexing strategies.

## Core Entity Model

### Primary Entities

```csharp
public class PetOwner
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Value Object using EF Core 9.0 Complex Types
    public Address Address { get; set; } = null!;
    
    // Navigation Properties
    public ICollection<Pet> Pets { get; } = [];
    public ICollection<Booking> Bookings { get; } = [];
    public ICollection<Review> ReviewsGiven { get; } = [];
    public ICollection<Review> ReviewsReceived { get; } = [];
    public ICollection<Message> MessagesSent { get; } = [];
    public ICollection<Message> MessagesReceived { get; } = [];
}

public class PetSitter
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public decimal HourlyRate { get; set; }
    public decimal OvernightRate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    
    // Calculated field for aggregate rating
    public decimal AverageRating { get; private set; }
    public int TotalReviews { get; private set; }
    
    // Value Objects using EF Core 9.0 Complex Types
    public Address Address { get; set; } = null!;
    public LocationCoordinates Location { get; set; } = null!;
    
    // Navigation Properties
    public ICollection<Service> Services { get; } = [];
    public ICollection<Availability> Availabilities { get; } = [];
    public ICollection<Booking> Bookings { get; } = [];
    public ICollection<Review> ReviewsGiven { get; } = [];
    public ICollection<Review> ReviewsReceived { get; } = [];
    public ICollection<Message> MessagesSent { get; } = [];
    public ICollection<Message> MessagesReceived { get; } = [];
    public ICollection<SitterPhoto> Photos { get; } = [];
    
    // Many-to-many relationships
    public ICollection<PetType> AcceptedPetTypes { get; } = [];
    public ICollection<Skill> Skills { get; } = [];
    
    // Method to recalculate rating
    public void UpdateRating(decimal newAverageRating, int reviewCount)
    {
        AverageRating = newAverageRating;
        TotalReviews = reviewCount;
    }
}

public class Pet
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Age { get; set; }
    public string Breed { get; set; } = null!;
    public decimal Weight { get; set; }
    public string SpecialNeeds { get; set; } = "";
    public string BehaviorNotes { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    
    // Foreign Keys
    public int PetOwnerId { get; set; }
    public int PetTypeId { get; set; }
    
    // Navigation Properties
    public PetOwner Owner { get; set; } = null!;
    public PetType PetType { get; set; } = null!;
    public ICollection<Booking> Bookings { get; } = [];
}

public class Booking
{
    public int Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalCost { get; set; }
    public string SpecialInstructions { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    
    // Foreign Keys
    public int PetOwnerId { get; set; }
    public int PetSitterId { get; set; }
    public int ServiceId { get; set; }
    
    // Navigation Properties
    public PetOwner PetOwner { get; set; } = null!;
    public PetSitter PetSitter { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public ICollection<Pet> Pets { get; } = []; // Many-to-many
    public ICollection<Review> Reviews { get; } = [];
    public ICollection<Message> Messages { get; } = [];
}

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public string Comment { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public bool IsVisible { get; set; } = true;
    
    // Polymorphic review - can be owner->sitter or sitter->owner
    public int ReviewerId { get; set; } // Either PetOwner or PetSitter ID
    public ReviewerType ReviewerType { get; set; }
    public int RevieweeId { get; set; } // Either PetOwner or PetSitter ID
    public ReviewerType RevieweeType { get; set; }
    
    // Foreign Key
    public int BookingId { get; set; }
    
    // Navigation Properties
    public Booking Booking { get; set; } = null!;
}

public class Service
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public ServiceType Type { get; set; }
    public int DurationInMinutes { get; set; }
    
    // Foreign Key
    public int PetSitterId { get; set; }
    
    // Navigation Properties
    public PetSitter PetSitter { get; set; } = null!;
    public ICollection<Booking> Bookings { get; } = [];
}

public class Availability
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public AvailabilityType Type { get; set; }
    public bool IsBooked { get; set; } = false;
    
    // Foreign Key
    public int PetSitterId { get; set; }
    
    // Navigation Properties
    public PetSitter PetSitter { get; set; } = null!;
}

public class PetType
{
    public int Id { get; set; }
    public string Name { get; set; } = null!; // Dog, Cat, Bird, Fish, etc.
    public string Category { get; set; } = null!; // Mammal, Bird, Reptile, etc.
    public bool RequiresSpecialCare { get; set; } = false;
    
    // Navigation Properties
    public ICollection<Pet> Pets { get; } = [];
    public ICollection<PetSitter> SittersWhoAccept { get; } = []; // Many-to-many
}

public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public SkillCategory Category { get; set; }
    
    // Navigation Properties
    public ICollection<PetSitter> Sitters { get; } = []; // Many-to-many
}

public class Message
{
    public int Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; } = false;
    public MessageType Type { get; set; }
    
    // Polymorphic messaging - can be between owner and sitter
    public int SenderId { get; set; }
    public UserType SenderType { get; set; }
    public int RecipientId { get; set; }
    public UserType RecipientType { get; set; }
    
    // Optional booking context
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }
}

public class SitterPhoto
{
    public int Id { get; set; }
    public string FileName { get; set; } = null!;
    public string Url { get; set; } = null!;
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; }
    public DateTime UploadedAt { get; set; }
    
    // Foreign Key
    public int PetSitterId { get; set; }
    
    // Navigation Properties
    public PetSitter PetSitter { get; set; } = null!;
}
```

### Value Objects using EF Core 9.0 Complex Types

```csharp
// Complex Type for addresses using EF Core 9.0 features
public class Address
{
    public string Street { get; init; } = null!;
    public string? Unit { get; init; }
    public string City { get; init; } = null!;
    public string State { get; init; } = null!;
    public string ZipCode { get; init; } = null!;
    public string Country { get; init; } = "United States";
    
    // Constructor for immutability
    public Address(string street, string? unit, string city, string state, string zipCode, string country = "United States")
    {
        Street = street;
        Unit = unit;
        City = city;
        State = state;
        ZipCode = zipCode;
        Country = country;
    }
    
    // Parameterless constructor for EF Core
    public Address() { }
}

// Complex Type for geographic coordinates
public class LocationCoordinates
{
    public decimal Latitude { get; init; }
    public decimal Longitude { get; init; }
    
    public LocationCoordinates(decimal latitude, decimal longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }
    
    // Parameterless constructor for EF Core
    public LocationCoordinates() { }
}
```

### Enumerations

```csharp
public enum BookingStatus
{
    Pending = 1,
    Accepted = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    Declined = 6
}

public enum ServiceType
{
    PetSitting = 1,
    DogWalking = 2,
    OvernightCare = 3,
    DayVisit = 4,
    MedicationAdmin = 5,
    GroomingBasic = 6
}

public enum AvailabilityType
{
    Available = 1,
    Blocked = 2,
    Booked = 3
}

public enum ReviewerType
{
    PetOwner = 1,
    PetSitter = 2
}

public enum SkillCategory
{
    Medical = 1,
    Training = 2,
    SpecialCare = 3,
    Grooming = 4,
    Exercise = 5
}

public enum MessageType
{
    BookingRequest = 1,
    BookingUpdate = 2,
    General = 3,
    System = 4
}

public enum UserType
{
    PetOwner = 1,
    PetSitter = 2
}
```

## Entity Framework Configuration

### DbContext Implementation

```csharp
public class PetSitterDbContext : DbContext
{
    public PetSitterDbContext(DbContextOptions<PetSitterDbContext> options) : base(options)
    {
    }
    
    // DbSets
    public DbSet<PetOwner> PetOwners => Set<PetOwner>();
    public DbSet<PetSitter> PetSitters => Set<PetSitter>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Availability> Availabilities => Set<Availability>();
    public DbSet<PetType> PetTypes => Set<PetType>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SitterPhoto> SitterPhotos => Set<SitterPhoto>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PetSitterDbContext).Assembly);
        
        // Configure enums to be stored as strings for readability
        ConfigureEnumsAsStrings(modelBuilder);
        
        // Seed initial data
        SeedInitialData(modelBuilder);
        
        base.OnModelCreating(modelBuilder);
    }
    
    private static void ConfigureEnumsAsStrings(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>()
            .Property(e => e.Status)
            .HasConversion<string>();
            
        modelBuilder.Entity<Service>()
            .Property(e => e.Type)
            .HasConversion<string>();
            
        modelBuilder.Entity<Availability>()
            .Property(e => e.Type)
            .HasConversion<string>();
            
        modelBuilder.Entity<Review>()
            .Property(e => e.ReviewerType)
            .HasConversion<string>();
            
        modelBuilder.Entity<Review>()
            .Property(e => e.RevieweeType)
            .HasConversion<string>();
            
        modelBuilder.Entity<Skill>()
            .Property(e => e.Category)
            .HasConversion<string>();
            
        modelBuilder.Entity<Message>()
            .Property(e => e.Type)
            .HasConversion<string>();
            
        modelBuilder.Entity<Message>()
            .Property(e => e.SenderType)
            .HasConversion<string>();
            
        modelBuilder.Entity<Message>()
            .Property(e => e.RecipientType)
            .HasConversion<string>();
    }
    
    private static void SeedInitialData(ModelBuilder modelBuilder)
    {
        // Seed pet types
        modelBuilder.Entity<PetType>().HasData(
            new PetType { Id = 1, Name = "Dog", Category = "Mammal", RequiresSpecialCare = false },
            new PetType { Id = 2, Name = "Cat", Category = "Mammal", RequiresSpecialCare = false },
            new PetType { Id = 3, Name = "Bird", Category = "Bird", RequiresSpecialCare = true },
            new PetType { Id = 4, Name = "Fish", Category = "Fish", RequiresSpecialCare = true },
            new PetType { Id = 5, Name = "Rabbit", Category = "Mammal", RequiresSpecialCare = false },
            new PetType { Id = 6, Name = "Hamster", Category = "Mammal", RequiresSpecialCare = true },
            new PetType { Id = 7, Name = "Guinea Pig", Category = "Mammal", RequiresSpecialCare = true },
            new PetType { Id = 8, Name = "Reptile", Category = "Reptile", RequiresSpecialCare = true }
        );
        
        // Seed skills
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 1, Name = "Pet First Aid", Description = "Certified in pet first aid", Category = SkillCategory.Medical },
            new Skill { Id = 2, Name = "Medication Administration", Description = "Experience giving medications", Category = SkillCategory.Medical },
            new Skill { Id = 3, Name = "Dog Training", Description = "Basic dog training skills", Category = SkillCategory.Training },
            new Skill { Id = 4, Name = "Senior Pet Care", Description = "Experience with senior animals", Category = SkillCategory.SpecialCare },
            new Skill { Id = 5, Name = "Puppy Care", Description = "Experience with young animals", Category = SkillCategory.SpecialCare },
            new Skill { Id = 6, Name = "Basic Grooming", Description = "Basic pet grooming skills", Category = SkillCategory.Grooming },
            new Skill { Id = 7, Name = "Exercise Specialist", Description = "High-energy pet exercise", Category = SkillCategory.Exercise }
        );
    }
}
```

### Entity Configurations

#### PetOwner Configuration

```csharp
public class PetOwnerConfiguration : IEntityTypeConfiguration<PetOwner>
{
    public void Configure(EntityTypeBuilder<PetOwner> builder)
    {
        builder.ToTable("PetOwners");
        
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
            
        // Complex type for Address (EF Core 9.0 feature)
        builder.ComplexProperty(e => e.Address, addressBuilder =>
        {
            addressBuilder.Property(a => a.Street)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("Address_Street");
                
            addressBuilder.Property(a => a.Unit)
                .HasMaxLength(50)
                .HasColumnName("Address_Unit");
                
            addressBuilder.Property(a => a.City)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("Address_City");
                
            addressBuilder.Property(a => a.State)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("Address_State");
                
            addressBuilder.Property(a => a.ZipCode)
                .IsRequired()
                .HasMaxLength(20)
                .HasColumnName("Address_ZipCode");
                
            addressBuilder.Property(a => a.Country)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("Address_Country")
                .HasDefaultValue("United States");
        });
        
        // Indexes
        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasDatabaseName("IX_PetOwners_Email");
            
        builder.HasIndex(e => new { e.FirstName, e.LastName })
            .HasDatabaseName("IX_PetOwners_FullName");
            
        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("IX_PetOwners_CreatedAt");
            
        // Relationships
        builder.HasMany(e => e.Pets)
            .WithOne(p => p.Owner)
            .HasForeignKey(p => p.PetOwnerId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(e => e.Bookings)
            .WithOne(b => b.PetOwner)
            .HasForeignKey(b => b.PetOwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

#### PetSitter Configuration

```csharp
public class PetSitterConfiguration : IEntityTypeConfiguration<PetSitter>
{
    public void Configure(EntityTypeBuilder<PetSitter> builder)
    {
        builder.ToTable("PetSitters");
        
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.Bio)
            .IsRequired()
            .HasMaxLength(2000);
            
        builder.Property(e => e.HourlyRate)
            .HasPrecision(10, 2);
            
        builder.Property(e => e.OvernightRate)
            .HasPrecision(10, 2);
            
        builder.Property(e => e.AverageRating)
            .HasPrecision(3, 2)
            .HasDefaultValue(0);
            
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
        
        // Complex type for Address
        builder.ComplexProperty(e => e.Address, addressBuilder =>
        {
            addressBuilder.Property(a => a.Street)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("Address_Street");
                
            addressBuilder.Property(a => a.Unit)
                .HasMaxLength(50)
                .HasColumnName("Address_Unit");
                
            addressBuilder.Property(a => a.City)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("Address_City");
                
            addressBuilder.Property(a => a.State)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("Address_State");
                
            addressBuilder.Property(a => a.ZipCode)
                .IsRequired()
                .HasMaxLength(20)
                .HasColumnName("Address_ZipCode");
                
            addressBuilder.Property(a => a.Country)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("Address_Country")
                .HasDefaultValue("United States");
        });
        
        // Complex type for Location coordinates
        builder.ComplexProperty(e => e.Location, locationBuilder =>
        {
            locationBuilder.Property(l => l.Latitude)
                .IsRequired()
                .HasPrecision(9, 6)
                .HasColumnName("Location_Latitude");
                
            locationBuilder.Property(l => l.Longitude)
                .IsRequired()
                .HasPrecision(9, 6)
                .HasColumnName("Location_Longitude");
        });
        
        // Indexes for efficient location-based queries
        builder.HasIndex(e => new { e.Location.Latitude, e.Location.Longitude })
            .HasDatabaseName("IX_PetSitters_Location");
            
        builder.HasIndex(e => e.AverageRating)
            .HasDatabaseName("IX_PetSitters_Rating");
            
        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasDatabaseName("IX_PetSitters_Email");
            
        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("IX_PetSitters_IsActive")
            .HasFilter("IsActive = 1"); // Partial index for active sitters only
            
        // Many-to-many relationship with PetTypes
        builder.HasMany(e => e.AcceptedPetTypes)
            .WithMany(pt => pt.SittersWhoAccept)
            .UsingEntity<Dictionary<string, object>>(
                "PetSitterPetTypes",
                j => j.HasOne<PetType>().WithMany().HasForeignKey("PetTypeId"),
                j => j.HasOne<PetSitter>().WithMany().HasForeignKey("PetSitterId"),
                j =>
                {
                    j.HasKey("PetSitterId", "PetTypeId");
                    j.HasIndex("PetTypeId");
                });
                
        // Many-to-many relationship with Skills
        builder.HasMany(e => e.Skills)
            .WithMany(s => s.Sitters)
            .UsingEntity<Dictionary<string, object>>(
                "PetSitterSkills",
                j => j.HasOne<Skill>().WithMany().HasForeignKey("SkillId"),
                j => j.HasOne<PetSitter>().WithMany().HasForeignKey("PetSitterId"),
                j =>
                {
                    j.HasKey("PetSitterId", "SkillId");
                    j.HasIndex("SkillId");
                });
    }
}
```

#### Booking Configuration

```csharp
public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");
        
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.TotalCost)
            .HasPrecision(10, 2);
            
        builder.Property(e => e.SpecialInstructions)
            .HasMaxLength(1000)
            .HasDefaultValue("");
            
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.Property(e => e.CancellationReason)
            .HasMaxLength(500);
        
        // Indexes for efficient queries
        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_Bookings_Status");
            
        builder.HasIndex(e => new { e.PetSitterId, e.StartDate, e.EndDate })
            .HasDatabaseName("IX_Bookings_SitterDates");
            
        builder.HasIndex(e => new { e.PetOwnerId, e.Status })
            .HasDatabaseName("IX_Bookings_OwnerStatus");
            
        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("IX_Bookings_CreatedAt");
            
        // Prevent overlapping bookings constraint
        builder.HasIndex(e => new { e.PetSitterId, e.StartDate, e.EndDate, e.Status })
            .HasDatabaseName("IX_Bookings_OverlapPrevention")
            .HasFilter("Status IN ('Accepted', 'InProgress')");
        
        // Relationships
        builder.HasOne(e => e.PetOwner)
            .WithMany(po => po.Bookings)
            .HasForeignKey(e => e.PetOwnerId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.PetSitter)
            .WithMany(ps => ps.Bookings)
            .HasForeignKey(e => e.PetSitterId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.Service)
            .WithMany(s => s.Bookings)
            .HasForeignKey(e => e.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Many-to-many with Pets
        builder.HasMany(e => e.Pets)
            .WithMany(p => p.Bookings)
            .UsingEntity<Dictionary<string, object>>(
                "BookingPets",
                j => j.HasOne<Pet>().WithMany().HasForeignKey("PetId"),
                j => j.HasOne<Booking>().WithMany().HasForeignKey("BookingId"),
                j =>
                {
                    j.HasKey("BookingId", "PetId");
                    j.HasIndex("PetId");
                });
        
        // Check constraints
        builder.ToTable(b => b.HasCheckConstraint(
            "CK_Bookings_DateRange", 
            "[EndDate] > [StartDate]"));
            
        builder.ToTable(b => b.HasCheckConstraint(
            "CK_Bookings_TotalCost", 
            "[TotalCost] >= 0"));
    }
}
```

#### Review Configuration

```csharp
public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");
        
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.Rating)
            .IsRequired();
            
        builder.Property(e => e.Comment)
            .HasMaxLength(1000)
            .HasDefaultValue("");
            
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
        
        // Indexes for efficient queries
        builder.HasIndex(e => new { e.RevieweeId, e.RevieweeType, e.IsVisible })
            .HasDatabaseName("IX_Reviews_RevieweeVisible");
            
        builder.HasIndex(e => new { e.BookingId })
            .HasDatabaseName("IX_Reviews_Booking");
            
        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("IX_Reviews_CreatedAt");
        
        // Relationships
        builder.HasOne(e => e.Booking)
            .WithMany(b => b.Reviews)
            .HasForeignKey(e => e.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Check constraints
        builder.ToTable(b => b.HasCheckConstraint(
            "CK_Reviews_Rating", 
            "[Rating] BETWEEN 1 AND 5"));
            
        // Prevent duplicate reviews for same booking and reviewer
        builder.HasIndex(e => new { e.BookingId, e.ReviewerId, e.ReviewerType })
            .IsUnique()
            .HasDatabaseName("IX_Reviews_Unique_Per_Booking_Reviewer");
    }
}
```

#### Availability Configuration

```csharp
public class AvailabilityConfiguration : IEntityTypeConfiguration<Availability>
{
    public void Configure(EntityTypeBuilder<Availability> builder)
    {
        builder.ToTable("Availabilities");
        
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Properties - using TimeOnly for time values (EF Core 6+)
        builder.Property(e => e.Date)
            .IsRequired();
            
        builder.Property(e => e.StartTime)
            .IsRequired();
            
        builder.Property(e => e.EndTime)
            .IsRequired();
        
        // Indexes for efficient availability queries
        builder.HasIndex(e => new { e.PetSitterId, e.Date, e.Type })
            .HasDatabaseName("IX_Availabilities_SitterDateType");
            
        builder.HasIndex(e => new { e.Date, e.Type })
            .HasDatabaseName("IX_Availabilities_DateType")
            .HasFilter("Type = 'Available'");
        
        // Relationships
        builder.HasOne(e => e.PetSitter)
            .WithMany(ps => ps.Availabilities)
            .HasForeignKey(e => e.PetSitterId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Check constraints
        builder.ToTable(b => b.HasCheckConstraint(
            "CK_Availabilities_TimeRange", 
            "[EndTime] > [StartTime]"));
            
        // Prevent overlapping availability slots
        builder.HasIndex(e => new { e.PetSitterId, e.Date, e.StartTime, e.EndTime })
            .IsUnique()
            .HasDatabaseName("IX_Availabilities_NoOverlap");
    }
}
```

## Advanced Querying Patterns

### Location-Based Queries

```csharp
// Repository method for finding sitters near a location
public async Task<List<PetSitterSearchResult>> FindSittersNearLocationAsync(
    decimal latitude, 
    decimal longitude, 
    int radiusInMiles = 25,
    List<int>? petTypeIds = null,
    DateTime? startDate = null,
    DateTime? endDate = null,
    CancellationToken cancellationToken = default)
{
    var query = _context.PetSitters
        .Where(s => s.IsActive)
        .Select(s => new
        {
            Sitter = s,
            Distance = Math.Sqrt(
                Math.Pow((double)(s.Location.Latitude - latitude) * 69.0, 2) +
                Math.Pow((double)(s.Location.Longitude - longitude) * 69.0 * 
                    Math.Cos((double)latitude / 57.2958), 2)
            )
        })
        .Where(x => x.Distance <= radiusInMiles);
    
    // Filter by pet types if specified
    if (petTypeIds?.Any() == true)
    {
        query = query.Where(x => x.Sitter.AcceptedPetTypes
            .Any(pt => petTypeIds.Contains(pt.Id)));
    }
    
    // Filter by availability if dates specified
    if (startDate.HasValue && endDate.HasValue)
    {
        query = query.Where(x => !x.Sitter.Bookings
            .Any(b => b.Status == BookingStatus.Accepted || b.Status == BookingStatus.InProgress)
            .Any(b => b.StartDate < endDate && b.EndDate > startDate));
    }
    
    var results = await query
        .OrderBy(x => x.Distance)
        .ThenByDescending(x => x.Sitter.AverageRating)
        .Take(50)
        .Select(x => new PetSitterSearchResult
        {
            Id = x.Sitter.Id,
            FirstName = x.Sitter.FirstName,
            LastName = x.Sitter.LastName,
            Bio = x.Sitter.Bio,
            HourlyRate = x.Sitter.HourlyRate,
            AverageRating = x.Sitter.AverageRating,
            TotalReviews = x.Sitter.TotalReviews,
            Distance = (decimal)x.Distance,
            Address = x.Sitter.Address,
            AcceptedPetTypes = x.Sitter.AcceptedPetTypes.Select(pt => pt.Name).ToList(),
            PrimaryPhoto = x.Sitter.Photos
                .Where(p => p.IsPrimary)
                .Select(p => p.Url)
                .FirstOrDefault()
        })
        .ToListAsync(cancellationToken);
    
    return results;
}
```

### Availability Conflict Prevention

```csharp
public async Task<bool> IsAvailableForBookingAsync(
    int petSitterId, 
    DateTime startDate, 
    DateTime endDate,
    int? excludeBookingId = null)
{
    // Check for conflicting bookings
    var hasConflictingBooking = await _context.Bookings
        .Where(b => b.PetSitterId == petSitterId)
        .Where(b => b.Status == BookingStatus.Accepted || b.Status == BookingStatus.InProgress)
        .Where(b => excludeBookingId == null || b.Id != excludeBookingId)
        .Where(b => b.StartDate < endDate && b.EndDate > startDate)
        .AnyAsync();
    
    if (hasConflictingBooking)
        return false;
    
    // Check availability calendar
    var daysInRange = Enumerable.Range(0, (endDate.Date - startDate.Date).Days + 1)
        .Select(offset => startDate.Date.AddDays(offset))
        .ToList();
    
    var unavailableDays = await _context.Availabilities
        .Where(a => a.PetSitterId == petSitterId)
        .Where(a => daysInRange.Contains(a.Date))
        .Where(a => a.Type == AvailabilityType.Blocked)
        .Select(a => a.Date)
        .ToListAsync();
    
    return !unavailableDays.Any();
}
```

### Aggregate Rating Calculation

```csharp
public async Task UpdateSitterRatingAsync(int petSitterId)
{
    var sitter = await _context.PetSitters
        .FirstOrDefaultAsync(s => s.Id == petSitterId);
    
    if (sitter == null) return;
    
    var reviewStats = await _context.Reviews
        .Where(r => r.RevieweeId == petSitterId && r.RevieweeType == ReviewerType.PetSitter)
        .Where(r => r.IsVisible)
        .GroupBy(r => r.RevieweeId)
        .Select(g => new
        {
            AverageRating = g.Average(r => r.Rating),
            TotalReviews = g.Count()
        })
        .FirstOrDefaultAsync();
    
    if (reviewStats != null)
    {
        sitter.UpdateRating((decimal)reviewStats.AverageRating, reviewStats.TotalReviews);
        await _context.SaveChangesAsync();
    }
}
```

## Performance Optimization Strategies

### Indexing Strategy

```sql
-- Key indexes for performance (auto-generated by EF Core configurations above)

-- Location-based search
CREATE NONCLUSTERED INDEX [IX_PetSitters_Location] 
ON [PetSitters] ([Location_Latitude], [Location_Longitude])

-- Sitter search and filtering
CREATE NONCLUSTERED INDEX [IX_PetSitters_Rating] 
ON [PetSitters] ([AverageRating] DESC)

CREATE NONCLUSTERED INDEX [IX_PetSitters_IsActive] 
ON [PetSitters] ([IsActive]) 
WHERE [IsActive] = 1

-- Booking queries
CREATE NONCLUSTERED INDEX [IX_Bookings_SitterDates] 
ON [Bookings] ([PetSitterId], [StartDate], [EndDate])

CREATE NONCLUSTERED INDEX [IX_Bookings_OverlapPrevention] 
ON [Bookings] ([PetSitterId], [StartDate], [EndDate], [Status])
WHERE [Status] IN ('Accepted', 'InProgress')

-- Review queries
CREATE NONCLUSTERED INDEX [IX_Reviews_RevieweeVisible] 
ON [Reviews] ([RevieweeId], [RevieweeType], [IsVisible])

-- Availability queries
CREATE NONCLUSTERED INDEX [IX_Availabilities_SitterDateType] 
ON [Availabilities] ([PetSitterId], [Date], [Type])

CREATE NONCLUSTERED INDEX [IX_Availabilities_DateType] 
ON [Availabilities] ([Date], [Type])
WHERE [Type] = 'Available'
```

### Query Optimization Patterns

```csharp
// Use projection to avoid loading unnecessary data
public async Task<List<SitterCardDto>> GetSitterCardsAsync(
    SitterSearchCriteria criteria)
{
    return await _context.PetSitters
        .Where(s => s.IsActive)
        .Where(s => criteria.PetTypeIds == null || 
            s.AcceptedPetTypes.Any(pt => criteria.PetTypeIds.Contains(pt.Id)))
        .Select(s => new SitterCardDto
        {
            Id = s.Id,
            FullName = s.FirstName + " " + s.LastName,
            AverageRating = s.AverageRating,
            TotalReviews = s.TotalReviews,
            HourlyRate = s.HourlyRate,
            City = s.Address.City,
            State = s.Address.State,
            PrimaryPhotoUrl = s.Photos
                .Where(p => p.IsPrimary)
                .Select(p => p.Url)
                .FirstOrDefault(),
            AcceptedPetTypeNames = s.AcceptedPetTypes
                .Select(pt => pt.Name)
                .ToList()
        })
        .OrderByDescending(s => s.AverageRating)
        .ThenBy(s => s.HourlyRate)
        .Take(criteria.PageSize)
        .ToListAsync();
}

// Use split queries for complex many-to-many relationships
public async Task<PetSitterDetailDto> GetSitterDetailAsync(int sitterId)
{
    return await _context.PetSitters
        .AsSplitQuery() // Prevents cartesian explosion
        .Include(s => s.AcceptedPetTypes)
        .Include(s => s.Skills)
        .Include(s => s.Photos.OrderBy(p => p.DisplayOrder))
        .Include(s => s.Services)
        .Where(s => s.Id == sitterId && s.IsActive)
        .Select(s => new PetSitterDetailDto
        {
            // Map properties...
        })
        .FirstOrDefaultAsync();
}
```

## Development vs Production Configuration

### In-Memory Database (Development)

```csharp
// Program.cs - Development configuration
public static void Main(string[] args)
{
    var builder = WebApplication.CreateBuilder(args);
    
    if (builder.Environment.IsDevelopment())
    {
        builder.Services.AddDbContext<PetSitterDbContext>(options =>
            options.UseInMemoryDatabase("PetSitterDb")
                   .EnableSensitiveDataLogging()
                   .EnableDetailedErrors());
    }
    else
    {
        builder.Services.AddDbContext<PetSitterDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    }
    
    var app = builder.Build();
    
    // Seed data in development
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PetSitterDbContext>();
        await SeedDevelopmentDataAsync(context);
    }
    
    app.Run();
}
```

### Azure SQL Database (Production)

```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:yourserver.database.windows.net,1433;Initial Catalog=PetSitterDb;Persist Security Info=False;User ID=yourusername;Password=yourpassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}

// Production optimizations
public static void ConfigureProductionDatabase(WebApplicationBuilder builder)
{
    builder.Services.AddDbContext<PetSitterDbContext>(options =>
    {
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
                
                sqlOptions.CommandTimeout(30);
            });
        
        if (!builder.Environment.IsProduction())
        {
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
        }
    });
    
    // Add health checks
    builder.Services.AddHealthChecks()
        .AddDbContextCheck<PetSitterDbContext>();
}
```

## Migration Strategy

```csharp
// Create and run migrations
// dotnet ef migrations add InitialCreate
// dotnet ef database update

// Production deployment migration script
public static async Task RunMigrationsAsync(IHost host)
{
    using var scope = host.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<PetSitterDbContext>();
    
    try
    {
        await context.Database.MigrateAsync();
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
        throw;
    }
}
```

## Summary

This EF Core design provides:

1. **Modern .NET 9.0/EF Core 9.0 patterns** using complex types for value objects
2. **Efficient many-to-many relationships** with proper join entity configuration
3. **Location-based querying** with spatial indexing
4. **Bidirectional review system** with polymorphic relationships
5. **Availability conflict prevention** through strategic indexing
6. **Performance optimization** through strategic indexing and query patterns
7. **Flexible development/production** configuration

The design supports all specified requirements while maintaining strong performance characteristics and following current EF Core best practices.