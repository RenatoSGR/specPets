using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Existing DbSets (from original Octopets)
    public DbSet<Listing> Listings { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;

    // New DbSets for Pet Sitter Marketplace
    public DbSet<PetOwner> PetOwners { get; set; } = null!;
    public DbSet<PetSitter> PetSitters { get; set; } = null!;
    public DbSet<Pet> Pets { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<Service> Services { get; set; } = null!;
    public DbSet<Availability> Availabilities { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints
        ConfigureMarketplaceEntities(modelBuilder);

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void ConfigureMarketplaceEntities(ModelBuilder modelBuilder)
    {
        // PetOwner configurations
        modelBuilder.Entity<PetOwner>()
            .HasIndex(po => po.Email)
            .IsUnique();

        modelBuilder.Entity<PetOwner>()
            .HasMany(po => po.Pets)
            .WithOne(p => p.Owner)
            .HasForeignKey(p => p.PetOwnerId);

        modelBuilder.Entity<PetOwner>()
            .HasMany(po => po.Bookings)
            .WithOne(b => b.PetOwner)
            .HasForeignKey(b => b.PetOwnerId);

        // PetSitter configurations
        modelBuilder.Entity<PetSitter>()
            .HasIndex(ps => ps.Email)
            .IsUnique();

        modelBuilder.Entity<PetSitter>()
            .HasMany(ps => ps.Services)
            .WithOne(s => s.PetSitter)
            .HasForeignKey(s => s.PetSitterId);

        modelBuilder.Entity<PetSitter>()
            .HasMany(ps => ps.Availabilities)
            .WithOne(a => a.PetSitter)
            .HasForeignKey(a => a.PetSitterId);

        modelBuilder.Entity<PetSitter>()
            .HasMany(ps => ps.BookingsReceived)
            .WithOne(b => b.PetSitter)
            .HasForeignKey(b => b.PetSitterId);

        // Booking configurations
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Service)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.ServiceId);

        modelBuilder.Entity<Booking>()
            .HasMany(b => b.Messages)
            .WithOne(m => m.Booking)
            .HasForeignKey(m => m.BookingId);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Review)
            .WithOne()
            .HasForeignKey<Review>(r => r.BookingId);

        // Review configurations
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Sitter)
            .WithMany(ps => ps.ReviewsReceived)
            .HasForeignKey(r => r.SitterId);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Owner)
            .WithMany(po => po.ReviewsWritten)
            .HasForeignKey(r => r.OwnerId);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Pet Owners
        modelBuilder.Entity<PetOwner>().HasData(
            new PetOwner
            {
                Id = 1,
                Email = "john.doe@email.com",
                Name = "John Doe",
                Phone = "555-0101",
                Address = "123 Main St",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90210",
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            },
            new PetOwner
            {
                Id = 2,
                Email = "sarah.smith@email.com",
                Name = "Sarah Smith",
                Phone = "555-0102",
                Address = "456 Oak Ave",
                City = "San Francisco",
                State = "CA",
                ZipCode = "94102",
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            }
        );

        // Seed Pets
        modelBuilder.Entity<Pet>().HasData(
            new Pet
            {
                Id = 1,
                PetOwnerId = 1,
                Name = "Max",
                Type = "Dog",
                Breed = "Golden Retriever",
                Age = 3,
                SpecialNeeds = "None",
                BehavioralNotes = "Friendly and energetic"
            },
            new Pet
            {
                Id = 2,
                PetOwnerId = 1,
                Name = "Luna",
                Type = "Cat",
                Breed = "Persian",
                Age = 2,
                SpecialNeeds = "Requires daily medication",
                BehavioralNotes = "Calm and affectionate"
            },
            new Pet
            {
                Id = 3,
                PetOwnerId = 2,
                Name = "Charlie",
                Type = "Dog",
                Breed = "Beagle",
                Age = 5,
                SpecialNeeds = "None",
                BehavioralNotes = "Loves walks and treats"
            }
        );

        // Seed Pet Sitters (Phase 7 - Enhanced with 10 diverse sitters)
        modelBuilder.Entity<PetSitter>().HasData(
            new PetSitter
            {
                Id = 1,
                Email = "emily.jones@petsitter.com",
                Name = "Emily Jones",
                Phone = "555-0201",
                Bio = "Experienced pet sitter with 5 years of professional experience. I specialize in dogs and cats, offering reliable overnight care and daily visits. First aid certified and trained in medication administration.",
                Address = "123 Main St",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001",
                Latitude = 34.0522,
                Longitude = -118.2437,
                HourlyRate = 25.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-2),
                ProfileCompleteness = 95
            },
            new PetSitter
            {
                Id = 2,
                Email = "mike.wilson@petsitter.com",
                Name = "Mike Wilson",
                Phone = "555-0202",
                Bio = "Certified dog trainer with 8 years of experience. Specializing in obedience training, grooming, and active walks. Your dogs will come home happy and well-trained!",
                Address = "456 Oak Ave",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90002",
                Latitude = 34.0689,
                Longitude = -118.4056,
                HourlyRate = 35.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-1),
                ProfileCompleteness = 90
            },
            new PetSitter
            {
                Id = 3,
                Email = "jessica.brown@petsitter.com",
                Name = "Jessica Brown",
                Phone = "555-0203",
                Bio = "Loving pet sitter specializing in multi-pet households. Experienced with dogs, cats, birds, and rabbits. Expert in medication administration and special needs care.",
                Address = "789 Pine St",
                City = "San Francisco",
                State = "CA",
                ZipCode = "94102",
                Latitude = 37.7749,
                Longitude = -122.4194,
                HourlyRate = 30.00m,
                CreatedAt = DateTime.UtcNow.AddMonths(-8),
                ProfileCompleteness = 100
            },
            new PetSitter
            {
                Id = 4,
                Email = "david.chen@petsitter.com",
                Name = "David Chen",
                Phone = "555-0204",
                Bio = "Exotic pet specialist with 10 years of experience caring for reptiles, birds, and other unique companions. Biology degree and certified in exotic animal care.",
                Address = "321 Elm St",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001",
                Latitude = 34.0522,
                Longitude = -118.2500,
                HourlyRate = 45.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-3),
                ProfileCompleteness = 88
            },
            new PetSitter
            {
                Id = 5,
                Email = "sarah.martinez@petsitter.com",
                Name = "Sarah Martinez",
                Phone = "555-0205",
                Bio = "Senior pet care specialist with a gentle touch. 12 years of experience providing compassionate care for older dogs and cats, including medication administration and mobility assistance.",
                Address = "654 Maple Dr",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90002",
                Latitude = 34.0689,
                Longitude = -118.4100,
                HourlyRate = 40.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-2),
                ProfileCompleteness = 92
            },
            new PetSitter
            {
                Id = 6,
                Email = "alex.taylor@petsitter.com",
                Name = "Alex Taylor",
                Phone = "555-0206",
                Bio = "Active and energetic dog walker perfect for high-energy breeds. Marathon runner offering long walks, runs, and hiking adventures. Your dog will be happily exhausted!",
                Address = "987 Cedar Ln",
                City = "San Francisco",
                State = "CA",
                ZipCode = "94102",
                Latitude = 37.7749,
                Longitude = -122.4250,
                HourlyRate = 28.00m,
                CreatedAt = DateTime.UtcNow.AddMonths(-10),
                ProfileCompleteness = 85
            },
            new PetSitter
            {
                Id = 7,
                Email = "maria.garcia@petsitter.com",
                Name = "Maria Garcia",
                Phone = "555-0207",
                Bio = "Certified professional groomer and pet care provider. 15 years of experience offering overnight care with optional grooming services. Your pets will look and feel their best!",
                Address = "246 Birch Ave",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001",
                Latitude = 34.0522,
                Longitude = -118.2400,
                HourlyRate = 50.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-4),
                ProfileCompleteness = 98
            },
            new PetSitter
            {
                Id = 8,
                Email = "tom.anderson@petsitter.com",
                Name = "Tom Anderson",
                Phone = "555-0208",
                Bio = "Small animal and bird specialist. Experienced with parrots, rabbits, guinea pigs, and other pocket pets. Patient and knowledgeable about their unique care requirements.",
                Address = "135 Willow Way",
                City = "San Francisco",
                State = "CA",
                ZipCode = "94102",
                Latitude = 37.7749,
                Longitude = -122.4300,
                HourlyRate = 32.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-1),
                ProfileCompleteness = 87
            },
            new PetSitter
            {
                Id = 9,
                Email = "linda.white@petsitter.com",
                Name = "Linda White",
                Phone = "555-0209",
                Bio = "Retired veterinary nurse with 20 years of medical experience. Offering medical-grade care for all pet types, specializing in medication administration, special needs care, and senior pets. Fully insured and bonded.",
                Address = "789 Spruce St",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90002",
                Latitude = 34.0689,
                Longitude = -118.4150,
                HourlyRate = 55.00m,
                CreatedAt = DateTime.UtcNow.AddYears(-1),
                ProfileCompleteness = 100
            },
            new PetSitter
            {
                Id = 10,
                Email = "carlos.rodriguez@petsitter.com",
                Name = "Carlos Rodriguez",
                Phone = "555-0210",
                Bio = "Multi-pet household expert! Experienced managing homes with multiple dogs and cats. Former shelter volunteer with training in animal behavior. Great with busy families and complex pet dynamics.",
                Address = "369 Ash Blvd",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001",
                Latitude = 34.0522,
                Longitude = -118.2350,
                HourlyRate = 38.00m,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                ProfileCompleteness = 90
            }
        );

        // Seed Services (Phase 7 - All 10 sitters with diverse service offerings)
        modelBuilder.Entity<Service>().HasData(
            // Emily Jones (id: 1) - dog, cat - overnight, daily visit
            new Service
            {
                Id = 1,
                PetSitterId = 1,
                Name = "overnight",
                Description = "Full overnight care at your home, includes feeding, walking, and playtime",
                Price = 75.00m,
                PriceUnit = "per night"
            },
            new Service
            {
                Id = 2,
                PetSitterId = 1,
                Name = "daily visit",
                Description = "30-minute visit including feeding, fresh water, and playtime",
                Price = 25.00m,
                PriceUnit = "per visit"
            },
            // Mike Wilson (id: 2) - dog - walking
            new Service
            {
                Id = 3,
                PetSitterId = 2,
                Name = "walking",
                Description = "60-minute dog walk in your neighborhood or local park",
                Price = 35.00m,
                PriceUnit = "per hour"
            },
            // Jessica Brown (id: 3) - cat, dog, bird, rabbit - overnight, medication
            new Service
            {
                Id = 4,
                PetSitterId = 3,
                Name = "overnight",
                Description = "Overnight care for cats, dogs, and small animals",
                Price = 80.00m,
                PriceUnit = "per night"
            },
            new Service
            {
                Id = 5,
                PetSitterId = 3,
                Name = "medication",
                Description = "Medication administration for pets requiring special care",
                Price = 30.00m,
                PriceUnit = "per visit"
            },
            // David Chen (id: 4) - reptile, bird, rabbit, other - medication
            new Service
            {
                Id = 6,
                PetSitterId = 4,
                Name = "medication",
                Description = "Specialized care for exotic pets including medication administration",
                Price = 45.00m,
                PriceUnit = "per visit"
            },
            // Sarah Martinez (id: 5) - dog, cat - overnight, medication
            new Service
            {
                Id = 7,
                PetSitterId = 5,
                Name = "overnight",
                Description = "Senior pet overnight care with gentle handling",
                Price = 90.00m,
                PriceUnit = "per night"
            },
            new Service
            {
                Id = 8,
                PetSitterId = 5,
                Name = "medication",
                Description = "Expert medication administration for senior pets",
                Price = 40.00m,
                PriceUnit = "per visit"
            },
            // Alex Taylor (id: 6) - dog - walking
            new Service
            {
                Id = 9,
                PetSitterId = 6,
                Name = "walking",
                Description = "High-energy dog walking and running sessions",
                Price = 28.00m,
                PriceUnit = "per hour"
            },
            // Maria Garcia (id: 7) - dog, cat - overnight, grooming
            new Service
            {
                Id = 10,
                PetSitterId = 7,
                Name = "overnight",
                Description = "Overnight care with optional grooming services",
                Price = 95.00m,
                PriceUnit = "per night"
            },
            new Service
            {
                Id = 11,
                PetSitterId = 7,
                Name = "grooming",
                Description = "Professional grooming including bath, trim, and nail clipping",
                Price = 50.00m,
                PriceUnit = "per session"
            },
            // Tom Anderson (id: 8) - bird, rabbit, other - daily visit
            new Service
            {
                Id = 12,
                PetSitterId = 8,
                Name = "daily visit",
                Description = "Daily care for birds and small animals",
                Price = 32.00m,
                PriceUnit = "per visit"
            },
            // Linda White (id: 9) - all types - overnight, medication
            new Service
            {
                Id = 13,
                PetSitterId = 9,
                Name = "overnight",
                Description = "Medical-grade overnight care for all pet types",
                Price = 120.00m,
                PriceUnit = "per night"
            },
            new Service
            {
                Id = 14,
                PetSitterId = 9,
                Name = "medication",
                Description = "Professional medication administration with nursing background",
                Price = 55.00m,
                PriceUnit = "per visit"
            },
            // Carlos Rodriguez (id: 10) - dog, cat - daily visit, walking
            new Service
            {
                Id = 15,
                PetSitterId = 10,
                Name = "daily visit",
                Description = "Daily visits for multi-pet households",
                Price = 38.00m,
                PriceUnit = "per visit"
            },
            new Service
            {
                Id = 16,
                PetSitterId = 10,
                Name = "walking",
                Description = "Group walks for multiple dogs",
                Price = 38.00m,
                PriceUnit = "per hour"
            }
        );

        // Seed Availabilities (next 30 days)
        var today = DateTime.Today;
        var availabilities = new List<Availability>();
        int availabilityId = 1;

        for (int sitterId = 1; sitterId <= 3; sitterId++)
        {
            for (int day = 0; day < 30; day++)
            {
                // Make some days unavailable for realism
                bool isAvailable = (day % 7 != 0); // Unavailable every 7th day

                availabilities.Add(new Availability
                {
                    Id = availabilityId++,
                    PetSitterId = sitterId,
                    StartDate = today.AddDays(day),
                    EndDate = today.AddDays(day + 1),
                    IsAvailable = isAvailable
                });
            }
        }

        modelBuilder.Entity<Availability>().HasData(availabilities);

        // Seed sample Bookings
        modelBuilder.Entity<Booking>().HasData(
            new Booking
            {
                Id = 1,
                PetOwnerId = 1,
                PetSitterId = 1,
                ServiceId = 2,
                StartDate = today.AddDays(5),
                EndDate = today.AddDays(5).AddHours(0.5),
                TotalCost = 25.00m,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Booking
            {
                Id = 2,
                PetOwnerId = 2,
                PetSitterId = 2,
                ServiceId = 3,
                StartDate = today.AddDays(3),
                EndDate = today.AddDays(3).AddMinutes(45),
                TotalCost = 20.00m,
                Status = BookingStatus.Accepted,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                AcceptedAt = DateTime.UtcNow.AddDays(-4)
            },
            new Booking
            {
                Id = 3,
                PetOwnerId = 2,
                PetSitterId = 1,
                ServiceId = 2,
                StartDate = today.AddDays(-10),
                EndDate = today.AddDays(-10).AddHours(0.5),
                TotalCost = 25.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                AcceptedAt = DateTime.UtcNow.AddDays(-14),
                CompletedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Booking
            {
                Id = 4,
                PetOwnerId = 1,
                PetSitterId = 3,
                ServiceId = 5,
                StartDate = today.AddDays(-8),
                EndDate = today.AddDays(-8).AddHours(0.5),
                TotalCost = 22.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-12),
                AcceptedAt = DateTime.UtcNow.AddDays(-11),
                CompletedAt = DateTime.UtcNow.AddDays(-8)
            },
            new Booking
            {
                Id = 5,
                PetOwnerId = 2,
                PetSitterId = 1,
                ServiceId = 1,
                StartDate = today.AddDays(-7),
                EndDate = today.AddDays(-6),
                TotalCost = 75.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                AcceptedAt = DateTime.UtcNow.AddDays(-9),
                CompletedAt = DateTime.UtcNow.AddDays(-6)
            },
            new Booking
            {
                Id = 6,
                PetOwnerId = 1,
                PetSitterId = 2,
                ServiceId = 4,
                StartDate = today.AddDays(-5),
                EndDate = today.AddDays(-5).AddHours(1),
                TotalCost = 60.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                AcceptedAt = DateTime.UtcNow.AddDays(-7),
                CompletedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Booking
            {
                Id = 7,
                PetOwnerId = 2,
                PetSitterId = 3,
                ServiceId = 5,
                StartDate = today.AddDays(-3),
                EndDate = today.AddDays(-3).AddHours(0.5),
                TotalCost = 22.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-6),
                AcceptedAt = DateTime.UtcNow.AddDays(-5),
                CompletedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Booking
            {
                Id = 8,
                PetOwnerId = 2,
                PetSitterId = 1,
                ServiceId = 2,
                StartDate = today.AddDays(-1),
                EndDate = today.AddDays(-1).AddHours(0.5),
                TotalCost = 25.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                AcceptedAt = DateTime.UtcNow.AddDays(-3),
                CompletedAt = DateTime.UtcNow.AddDays(-1)
            }
        );

        // Seed Reviews (Phase 6)
        modelBuilder.Entity<Review>().HasData(
            new Review
            {
                Id = "review-1",
                OwnerId = 1,
                SitterId = 1,
                BookingId = 3,
                Rating = 5,
                Comment = "Emily was fantastic! My dog Max loved her and she sent daily photo updates. Highly recommend for anyone looking for a reliable pet sitter!",
                CreatedAt = DateTime.Parse("2024-03-01T10:00:00Z")
            },
            new Review
            {
                Id = "review-2",
                OwnerId = 2,
                SitterId = 2,
                BookingId = 6,
                Rating = 5,
                Comment = "Mike is a true professional. His training techniques worked wonders with my dog. We've seen huge improvements in behavior!",
                CreatedAt = DateTime.Parse("2024-03-05T10:00:00Z")
            },
            new Review
            {
                Id = "review-3",
                OwnerId = 2,
                SitterId = 1,
                BookingId = 5,
                Rating = 4,
                Comment = "Great experience overall. Emily was reliable and my cats were well cared for. Would definitely book again!",
                CreatedAt = DateTime.Parse("2024-03-10T10:00:00Z")
            },
            new Review
            {
                Id = "review-4",
                OwnerId = 1,
                SitterId = 3,
                BookingId = 4,
                Rating = 5,
                Comment = "Jessica is amazing with cats! She really understands their needs and my two cats were so happy when I got home.",
                CreatedAt = DateTime.Parse("2024-03-12T14:30:00Z")
            },
            new Review
            {
                Id = "review-5",
                OwnerId = 2,
                SitterId = 1,
                BookingId = 8,
                Rating = 5,
                Comment = "Emily went above and beyond during our vacation. She even watered our plants! Such a caring and thoughtful sitter.",
                CreatedAt = DateTime.Parse("2024-03-15T09:15:00Z")
            },
            new Review
            {
                Id = "review-6",
                OwnerId = 1,
                SitterId = 2,
                BookingId = 6,
                Rating = 4,
                Comment = "Mike was great with our energetic dog. The training tips he shared were really helpful. Only minor issue was a slight delay one day.",
                CreatedAt = DateTime.Parse("2024-03-18T16:45:00Z")
            },
            new Review
            {
                Id = "review-7",
                OwnerId = 2,
                SitterId = 3,
                BookingId = 7,
                Rating = 5,
                Comment = "Jessica took wonderful care of our rabbit and bird. She clearly has experience with different types of pets. 10/10 would book again!",
                CreatedAt = DateTime.Parse("2024-03-20T11:00:00Z")
            },
            new Review
            {
                Id = "review-8",
                OwnerId = 2,
                SitterId = 1,
                BookingId = 8,
                Rating = 5,
                Comment = "Third time booking with Emily and she never disappoints! My dog gets so excited when she arrives. Thank you Emily!",
                CreatedAt = DateTime.Parse("2024-03-22T13:20:00Z")
            }
        );
    }
}

// Placeholder for existing Listing model (from original Octopets)
public class Listing
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    // ... other properties
}
