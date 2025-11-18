using Microsoft.AspNetCore.Mvc;
using Backend.Repositories.Interfaces;

namespace Backend.Endpoints;

public static class PetOwnerEndpoints
{
    public static RouteGroupBuilder MapPetOwnerEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{id:int}/bookings", GetOwnerBookings)
            .WithName("GetOwnerBookings")
            .WithDescription("Get all bookings for a pet owner")
            .WithOpenApi();

        return group;
    }

    /// <summary>
    /// Get all bookings for a pet owner
    /// </summary>
    private static async Task<IResult> GetOwnerBookings(
        [FromServices] IBookingRepository repo,
        int id)
    {
        var bookings = await repo.GetByOwnerIdAsync(id);

        return Results.Ok(bookings.Select(b => new
        {
            b.Id,
            b.PetOwnerId,
            b.PetSitterId,
            b.ServiceId,
            b.PetIds,
            b.StartDate,
            b.EndDate,
            b.TotalCost,
            b.Status,
            b.StatusReason,
            b.CreatedAt,
            b.AcceptedAt,
            b.CompletedAt,
            b.CancelledAt,
            SitterName = b.PetSitter?.Name,
            ServiceName = b.Service?.Name
        }));
    }
}
