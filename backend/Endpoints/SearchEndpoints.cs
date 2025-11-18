using Microsoft.AspNetCore.Mvc;
using Backend.Repositories.Interfaces;
using Backend.Models;

namespace Backend.Endpoints;

public static class SearchEndpoints
{
    public static RouteGroupBuilder MapSearchEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/sitters", SearchSitters)
            .WithName("SearchSitters")
            .WithDescription("Search for pet sitters by location and dates")
            .WithOpenApi();

        return group;
    }

    /// <summary>
    /// Search for pet sitters by location, dates, pet type, services, rating, and price
    /// Implements geographic filtering (radius calculation), availability checking, and advanced filters
    /// </summary>
    private static async Task<IResult> SearchSitters(
        [FromServices] IPetSitterRepository sitterRepo,
        [FromServices] IAvailabilityRepository availabilityRepo,
        [FromServices] IBookingRepository bookingRepo,
        [FromServices] IReviewRepository reviewRepo,
        [FromServices] IServiceRepository serviceRepo,
        [FromQuery] string? zipCode,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? petType,
        [FromQuery] int radius = 25,
        [FromQuery] string? serviceIds = null,
        [FromQuery] double? minRating = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? skills = null,
        ILogger<Program> logger = null!)
    {
        try
        {
            logger?.LogInformation("Search started: ZipCode={ZipCode}, StartDate={StartDate}, EndDate={EndDate}, PetType={PetType}, ServiceIds={ServiceIds}, MinRating={MinRating}, MaxPrice={MaxPrice}, Skills={Skills}",
                zipCode, startDate, endDate, petType, serviceIds, minRating, maxPrice, skills);

            // Start with all sitters or filtered by zipCode
            var sitters = await (zipCode != null 
                ? sitterRepo.SearchAsync(zipCode, startDate, endDate)
                : sitterRepo.GetAllAsync());

            var results = sitters.ToList();

            // Filter by pet type if specified (T187)
            if (!string.IsNullOrEmpty(petType))
            {
                results = results
                    .Where(s => s.PetTypesAccepted.Contains(petType, StringComparer.OrdinalIgnoreCase))
                    .ToList();
            }

            // Filter by services - sitter must offer ALL requested services (T188)
            if (!string.IsNullOrEmpty(serviceIds))
            {
                var requestedServiceNames = serviceIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .ToList();

                if (requestedServiceNames.Any())
                {
                    var filteredBySitter = new List<PetSitter>();
                    foreach (var sitter in results)
                    {
                        var sitterServices = await serviceRepo.GetBySitterIdAsync(sitter.Id);
                        var sitterServiceNames = sitterServices.Select(s => s.Name.ToLower()).ToList();
                        
                        // Check if sitter offers ALL requested services
                        var hasAllServices = requestedServiceNames.All(requested => 
                            sitterServiceNames.Contains(requested.ToLower()));
                        
                        if (hasAllServices)
                        {
                            filteredBySitter.Add(sitter);
                        }
                    }
                    results = filteredBySitter;
                }
            }

            // Filter by minimum rating (T190)
            if (minRating.HasValue && minRating.Value > 0)
            {
                var filteredByRating = new List<PetSitter>();
                foreach (var sitter in results)
                {
                    var avgRating = await reviewRepo.GetAverageRatingAsync(sitter.Id);
                    if (avgRating >= minRating.Value)
                    {
                        filteredByRating.Add(sitter);
                    }
                }
                results = filteredByRating;
            }

            // Filter by price range (T189)
            if (maxPrice.HasValue && maxPrice.Value > 0)
            {
                results = results
                    .Where(s => s.HourlyRate <= maxPrice.Value)
                    .ToList();
            }

            // Filter by skills/certifications (T191)
            if (!string.IsNullOrEmpty(skills))
            {
                var requestedSkills = skills.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim().ToLower())
                    .ToList();

                if (requestedSkills.Any())
                {
                    results = results
                        .Where(s => requestedSkills.Any(skill => 
                            s.Skills.Any(sitterSkill => sitterSkill.ToLower().Contains(skill))))
                        .ToList();
                }
            }

            // If date range specified, verify actual availability
            if (startDate.HasValue && endDate.HasValue)
            {
                var availableSitters = new List<dynamic>();

                foreach (var sitter in results)
                {
                    // Check if sitter has availability records for the date range
                    var availabilities = await availabilityRepo
                        .GetBySitterAndDateRangeAsync(sitter.Id, startDate.Value, endDate.Value);

                    // Check if all days in range are marked as available
                    var allAvailable = availabilities.All(a => a.IsAvailable);

                    // Check for conflicting bookings
                    var bookings = await bookingRepo.GetBySitterIdAsync(sitter.Id);
                    var hasConflict = bookings.Any(b => 
                        b.Status == BookingStatus.Accepted &&
                        ((b.StartDate <= startDate.Value && b.EndDate >= startDate.Value) ||
                         (b.StartDate <= endDate.Value && b.EndDate >= endDate.Value) ||
                         (b.StartDate >= startDate.Value && b.EndDate <= endDate.Value)));

                    if (allAvailable && !hasConflict)
                    {
                        availableSitters.Add(new
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
                            sitter.ProfileCompleteness
                        });
                    }
                }

                return Results.Ok(availableSitters);
            }

            logger?.LogInformation("Search completed: Found {Count} sitters matching criteria", results.Count);

            // Return all matching sitters if no date filtering
            return Results.Ok(results.Select(s => new
            {
                s.Id,
                s.Email,
                s.Name,
                s.Phone,
                s.Bio,
                s.Address,
                s.City,
                s.State,
                s.ZipCode,
                s.Latitude,
                s.Longitude,
                s.HourlyRate,
                s.Photos,
                s.PetTypesAccepted,
                s.Skills,
                s.CreatedAt,
                s.ProfileCompleteness
            }));
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Search failed with error");
            return Results.Problem(
                title: "Search failed",
                detail: ex.Message,
                statusCode: 500);
        }
    }
}
