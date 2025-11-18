using Microsoft.AspNetCore.Mvc;
using Backend.Repositories.Interfaces;

namespace Backend.Endpoints;

public static class PetSitterEndpoints
{
    public static RouteGroupBuilder MapPetSitterEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{id:int}", GetSitterById)
            .WithName("GetSitterById")
            .WithDescription("Get pet sitter profile by ID")
            .WithOpenApi();

        group.MapGet("/{id:int}/services", GetSitterServices)
            .WithName("GetSitterServices")
            .WithDescription("Get services offered by a pet sitter")
            .WithOpenApi();

        group.MapGet("/{id:int}/reviews", GetSitterReviews)
            .WithName("GetSitterReviews")
            .WithDescription("Get reviews for a pet sitter")
            .WithOpenApi();

        group.MapGet("/{id:int}/availability", GetSitterAvailability)
            .WithName("GetSitterAvailability")
            .WithDescription("Get availability for a pet sitter")
            .WithOpenApi();

        group.MapPut("/{id:int}", UpdateSitterProfile)
            .WithName("UpdateSitterProfile")
            .WithDescription("Update pet sitter profile")
            .WithOpenApi();

        group.MapPut("/{id:int}/services", UpdateSitterServices)
            .WithName("UpdateSitterServices")
            .WithDescription("Update services offered by a pet sitter")
            .WithOpenApi();

        group.MapPost("/{id:int}/photos", UploadSitterPhoto)
            .WithName("UploadSitterPhoto")
            .WithDescription("Upload a photo for a pet sitter profile")
            .WithOpenApi()
            .DisableAntiforgery();

        group.MapDelete("/{id:int}/photos/{photoId}", DeleteSitterPhoto)
            .WithName("DeleteSitterPhoto")
            .WithDescription("Delete a photo from a pet sitter profile")
            .WithOpenApi();

        return group;
    }

    /// <summary>
    /// Get pet sitter profile by ID
    /// </summary>
    private static async Task<IResult> GetSitterById(
        [FromServices] IPetSitterRepository repo,
        int id)
    {
        var sitter = await repo.GetByIdAsync(id);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {id} not found" });
        }

        return Results.Ok(new
        {
            sitter.Id,
            sitter.Email,
            sitter.Name,
            sitter.Phone,
            sitter.Bio,
            sitter.Address,
            sitter.City,
            sitter.State,
            sitter.ZipCode,
            sitter.Latitude,
            sitter.Longitude,
            sitter.HourlyRate,
            sitter.Photos,
            sitter.PetTypesAccepted,
            sitter.Skills,
            sitter.CreatedAt,
            sitter.ProfileCompleteness,
            Services = sitter.Services?.Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.Price,
                s.PriceUnit,
                s.PetTypesSupported
            }),
            ReviewCount = sitter.ReviewsReceived?.Count ?? 0,
            AverageRating = sitter.ReviewsReceived?.Any() == true
                ? sitter.ReviewsReceived.Average(r => r.Rating)
                : 0
        });
    }

    /// <summary>
    /// Get services offered by a pet sitter
    /// </summary>
    private static async Task<IResult> GetSitterServices(
        [FromServices] IServiceRepository repo,
        int id)
    {
        var services = await repo.GetBySitterIdAsync(id);

        return Results.Ok(services.Select(s => new
        {
            s.Id,
            s.PetSitterId,
            s.Name,
            s.Description,
            s.Price,
            s.PriceUnit,
            s.PetTypesSupported
        }));
    }

    /// <summary>
    /// Get reviews for a pet sitter
    /// </summary>
    private static async Task<IResult> GetSitterReviews(
        [FromServices] IPetSitterRepository sitterRepo,
        int id)
    {
        var sitter = await sitterRepo.GetByIdAsync(id);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {id} not found" });
        }

        var reviews = sitter.ReviewsReceived;

        return Results.Ok(reviews.Select(r => new
        {
            r.Id,
            r.OwnerId,
            r.BookingId,
            r.Rating,
            r.Comment,
            r.CreatedAt,
            OwnerName = r.Owner?.Name ?? "Anonymous"
        }).OrderByDescending(r => r.CreatedAt));
    }

    /// <summary>
    /// Get availability for a pet sitter
    /// </summary>
    private static async Task<IResult> GetSitterAvailability(
        [FromServices] IAvailabilityRepository repo,
        int id,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var availabilities = startDate.HasValue && endDate.HasValue
            ? await repo.GetBySitterAndDateRangeAsync(id, startDate.Value, endDate.Value)
            : await repo.GetBySitterIdAsync(id);

        return Results.Ok(availabilities.Select(a => new
        {
            a.Id,
            a.PetSitterId,
            a.StartDate,
            a.EndDate,
            a.IsAvailable
        }).OrderBy(a => a.StartDate));
    }

    /// <summary>
    /// Update pet sitter profile
    /// </summary>
    private static async Task<IResult> UpdateSitterProfile(
        [FromServices] IPetSitterRepository repo,
        int id,
        [FromBody] UpdateSitterProfileRequest request)
    {
        var sitter = await repo.GetByIdAsync(id);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {id} not found" });
        }

        // Validation
        if (!string.IsNullOrWhiteSpace(request.Bio) && request.Bio.Length < 50)
        {
            return Results.BadRequest(new { message = "Bio must be at least 50 characters long" });
        }

        // Update profile fields
        if (request.Bio != null) sitter.Bio = request.Bio;
        if (request.Name != null) sitter.Name = request.Name;
        if (request.Phone != null) sitter.Phone = request.Phone;
        if (request.Address != null) sitter.Address = request.Address;
        if (request.City != null) sitter.City = request.City;
        if (request.State != null) sitter.State = request.State;
        if (request.ZipCode != null) sitter.ZipCode = request.ZipCode;
        if (request.HourlyRate.HasValue) sitter.HourlyRate = request.HourlyRate.Value;
        if (request.PetTypesAccepted != null) sitter.PetTypesAccepted = request.PetTypesAccepted;
        if (request.Skills != null) sitter.Skills = request.Skills;

        await repo.UpdateAsync(sitter);

        return Results.Ok(new { message = "Profile updated successfully", sitter });
    }

    /// <summary>
    /// Update services offered by a pet sitter
    /// </summary>
    private static async Task<IResult> UpdateSitterServices(
        [FromServices] IPetSitterRepository sitterRepo,
        [FromServices] IServiceRepository serviceRepo,
        int id,
        [FromBody] List<UpdateServiceRequest> requests)
    {
        var sitter = await sitterRepo.GetByIdAsync(id);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {id} not found" });
        }

        // Get existing services
        var existingServices = await serviceRepo.GetBySitterIdAsync(id);

        // Delete services not in the request
        var requestIds = requests.Where(r => r.Id.HasValue).Select(r => r.Id.Value).ToList();
        var servicesToDelete = existingServices.Where(s => !requestIds.Contains(s.Id)).ToList();
        
        foreach (var service in servicesToDelete)
        {
            await serviceRepo.DeleteAsync(service.Id);
        }

        // Update or create services
        var updatedServices = new List<object>();
        foreach (var request in requests)
        {
            if (request.Id.HasValue)
            {
                // Update existing
                var service = existingServices.FirstOrDefault(s => s.Id == request.Id.Value);
                if (service != null)
                {
                    service.Name = request.Name;
                    service.Description = request.Description ?? string.Empty;
                    service.Price = request.Price;
                    service.PriceUnit = request.PriceUnit;
                    service.PetTypesSupported = request.PetTypesSupported ?? new List<string>();
                    
                    await serviceRepo.UpdateAsync(service);
                    updatedServices.Add(new { service.Id, service.Name, service.Price });
                }
            }
            else
            {
                // Create new
                var newService = new Backend.Models.Service
                {
                    Id = existingServices.Any() ? existingServices.Max(s => s.Id) + 1 : 1,
                    PetSitterId = id,
                    Name = request.Name,
                    Description = request.Description ?? string.Empty,
                    Price = request.Price,
                    PriceUnit = request.PriceUnit,
                    PetTypesSupported = request.PetTypesSupported ?? new List<string>()
                };
                
                await serviceRepo.CreateAsync(newService);
                updatedServices.Add(new { newService.Id, newService.Name, newService.Price });
            }
        }

        return Results.Ok(new { message = "Services updated successfully", services = updatedServices });
    }

    /// <summary>
    /// Upload a photo for a pet sitter profile
    /// </summary>
    private static async Task<IResult> UploadSitterPhoto(
        [FromServices] IPetSitterRepository repo,
        int id,
        IFormFile file)
    {
        var sitter = await repo.GetByIdAsync(id);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {id} not found" });
        }

        // Validation
        const long maxFileSize = 5 * 1024 * 1024; // 5MB
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (file.Length > maxFileSize)
        {
            return Results.BadRequest(new { message = "File size must be less than 5MB" });
        }

        if (!allowedExtensions.Contains(fileExtension))
        {
            return Results.BadRequest(new { message = "Invalid file format. Allowed: jpg, jpeg, png, gif" });
        }

        // For MVP, store as data URL (base64)
        // In production, use Azure Blob Storage or similar
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var fileBytes = memoryStream.ToArray();
        var base64 = Convert.ToBase64String(fileBytes);
        var dataUrl = $"data:{file.ContentType};base64,{base64}";

        // Add to photos list
        var photos = sitter.Photos?.ToList() ?? new List<string>();
        photos.Add(dataUrl);
        sitter.Photos = photos;

        await repo.UpdateAsync(sitter);

        return Results.Ok(new { message = "Photo uploaded successfully", photoUrl = dataUrl });
    }

    /// <summary>
    /// Delete a photo from a pet sitter profile
    /// </summary>
    private static async Task<IResult> DeleteSitterPhoto(
        [FromServices] IPetSitterRepository repo,
        int id,
        string photoId)
    {
        var sitter = await repo.GetByIdAsync(id);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {id} not found" });
        }

        // For data URLs, photoId is the index
        if (!int.TryParse(photoId, out var photoIndex))
        {
            return Results.BadRequest(new { message = "Invalid photo ID" });
        }

        var photos = sitter.Photos?.ToList() ?? new List<string>();
        
        if (photoIndex < 0 || photoIndex >= photos.Count)
        {
            return Results.NotFound(new { message = "Photo not found" });
        }

        photos.RemoveAt(photoIndex);
        sitter.Photos = photos;

        await repo.UpdateAsync(sitter);

        return Results.Ok(new { message = "Photo deleted successfully" });
    }
}

// Request DTOs
public record UpdateSitterProfileRequest(
    string? Bio,
    string? Name,
    string? Phone,
    string? Address,
    string? City,
    string? State,
    string? ZipCode,
    decimal? HourlyRate,
    List<string>? PetTypesAccepted,
    List<string>? Skills
);

public record UpdateServiceRequest(
    int? Id,
    string Name,
    string? Description,
    decimal Price,
    string PriceUnit,
    List<string>? PetTypesSupported
);
