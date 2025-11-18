using Microsoft.AspNetCore.Mvc;
using Backend.Repositories.Interfaces;
using Backend.Models;

namespace Backend.Endpoints;

public static class AvailabilityEndpoints
{
    public static RouteGroupBuilder MapAvailabilityEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{sitterId:int}", GetSitterAvailability)
            .WithName("GetAvailability")
            .WithDescription("Get availability for a pet sitter")
            .WithOpenApi();

        group.MapPut("/{sitterId:int}", UpdateSitterAvailability)
            .WithName("UpdateAvailability")
            .WithDescription("Update availability for a pet sitter (batch)")
            .WithOpenApi();

        return group;
    }

    /// <summary>
    /// Get availability for a pet sitter within a date range
    /// </summary>
    private static async Task<IResult> GetSitterAvailability(
        [FromServices] IAvailabilityRepository repo,
        int sitterId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var availabilities = startDate.HasValue && endDate.HasValue
            ? await repo.GetBySitterAndDateRangeAsync(sitterId, startDate.Value, endDate.Value)
            : await repo.GetBySitterIdAsync(sitterId);

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
    /// Update availability for a pet sitter (batch update)
    /// </summary>
    private static async Task<IResult> UpdateSitterAvailability(
        [FromServices] IAvailabilityRepository repo,
        [FromServices] IPetSitterRepository sitterRepo,
        int sitterId,
        [FromBody] List<UpdateAvailabilityRequest> requests)
    {
        var sitter = await sitterRepo.GetByIdAsync(sitterId);
        
        if (sitter == null)
        {
            return Results.NotFound(new { message = $"Pet sitter with ID {sitterId} not found" });
        }

        // Validation
        foreach (var request in requests)
        {
            if (request.StartDate >= request.EndDate)
            {
                return Results.BadRequest(new { message = "End date must be after start date" });
            }

            if (request.StartDate < DateTime.UtcNow.Date)
            {
                return Results.BadRequest(new { message = "Cannot set availability for past dates" });
            }
        }

        // Get existing availabilities for the sitter
        var existingAvailabilities = await repo.GetBySitterIdAsync(sitterId);

        // Update or create availabilities
        var updatedAvailabilities = new List<object>();
        
        foreach (var request in requests)
        {
            if (request.Id.HasValue)
            {
                // Update existing
                var availability = existingAvailabilities.FirstOrDefault(a => a.Id == request.Id.Value);
                if (availability != null)
                {
                    availability.StartDate = request.StartDate;
                    availability.EndDate = request.EndDate;
                    availability.IsAvailable = request.IsAvailable;
                    
                    await repo.UpdateAsync(availability);
                    updatedAvailabilities.Add(new { availability.Id, availability.StartDate, availability.EndDate, availability.IsAvailable });
                }
            }
            else
            {
                // Create new
                var newAvailability = new Availability
                {
                    Id = existingAvailabilities.Any() ? existingAvailabilities.Max(a => a.Id) + 1 : 1,
                    PetSitterId = sitterId,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    IsAvailable = request.IsAvailable
                };
                
                await repo.CreateAsync(newAvailability);
                updatedAvailabilities.Add(new { newAvailability.Id, newAvailability.StartDate, newAvailability.EndDate, newAvailability.IsAvailable });
            }
        }

        return Results.Ok(new { message = "Availability updated successfully", availabilities = updatedAvailabilities });
    }
}

// Request DTOs
public record UpdateAvailabilityRequest(
    int? Id,
    DateTime StartDate,
    DateTime EndDate,
    bool IsAvailable
);
