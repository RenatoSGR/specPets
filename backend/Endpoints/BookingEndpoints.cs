using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Endpoints;

public static class BookingEndpoints
{
    public static RouteGroupBuilder MapBookingEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", CreateBooking)
            .WithName("CreateBooking")
            .WithDescription("Create a new booking request")
            .WithOpenApi();

        group.MapGet("/{id:int}", GetBookingById)
            .WithName("GetBookingById")
            .WithDescription("Get booking details by ID")
            .WithOpenApi();

        // Phase 5: Booking Management Endpoints
        group.MapGet("/pending", GetPendingBookings)
            .WithName("GetPendingBookings")
            .WithDescription("Get all pending booking requests for sitter (filtered by sitterId query param)")
            .WithOpenApi();

        group.MapPut("/{id:int}/accept", AcceptBooking)
            .WithName("AcceptBooking")
            .WithDescription("Accept a pending booking request")
            .WithOpenApi();

        group.MapPut("/{id:int}/decline", DeclineBooking)
            .WithName("DeclineBooking")
            .WithDescription("Decline a pending booking request with reason")
            .WithOpenApi();

        group.MapPut("/{id:int}/cancel", CancelBooking)
            .WithName("CancelBooking")
            .WithDescription("Cancel a booking (with cancellation policy applied)")
            .WithOpenApi();

        group.MapPatch("/{id:int}/status", UpdateBookingStatus)
            .WithName("UpdateBookingStatus")
            .WithDescription("Update booking status (accept/decline/cancel/complete)")
            .WithOpenApi();

        return group;
    }

    /// <summary>
    /// Get all pending booking requests for a sitter
    /// Phase 5: T108
    /// </summary>
    private static async Task<IResult> GetPendingBookings(
        [FromServices] IBookingRepository repo,
        [FromQuery] int? sitterId)
    {
        try
        {
            if (!sitterId.HasValue)
            {
                return Results.BadRequest(new { message = "sitterId query parameter is required" });
            }

            var bookings = await repo.GetBySitterIdAsync(sitterId.Value);
            var pendingBookings = bookings
                .Where(b => b.Status == BookingStatus.Pending)
                .OrderBy(b => b.StartDate)
                .Select(b => new
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
                    b.CreatedAt,
                    OwnerName = b.PetOwner?.Name,
                    ServiceName = b.Service?.Name,
                    PetCount = b.PetIds.Count
                })
                .ToList();

            return Results.Ok(pendingBookings);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to retrieve pending bookings",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Accept a pending booking request
    /// Phase 5: T109
    /// Auto-marks dates as unavailable (T113)
    /// </summary>
    private static async Task<IResult> AcceptBooking(
        [FromServices] IBookingRepository bookingRepo,
        [FromServices] IAvailabilityRepository availabilityRepo,
        int id)
    {
        try
        {
            var booking = await bookingRepo.GetByIdAsync(id);

            if (booking == null)
            {
                return Results.NotFound(new { message = $"Booking with ID {id} not found" });
            }

            // T112: Validate status transition
            if (booking.Status != BookingStatus.Pending)
            {
                return Results.BadRequest(new { message = "Only pending bookings can be accepted" });
            }

            // Check for conflicting bookings
            var existingBookings = await bookingRepo.GetBySitterIdAsync(booking.PetSitterId);
            var hasConflict = existingBookings.Any(b =>
                b.Id != id &&
                b.Status == BookingStatus.Accepted &&
                ((b.StartDate <= booking.StartDate && b.EndDate >= booking.StartDate) ||
                 (b.StartDate <= booking.EndDate && b.EndDate >= booking.EndDate) ||
                 (b.StartDate >= booking.StartDate && b.EndDate <= booking.EndDate)));

            if (hasConflict)
            {
                return Results.BadRequest(new { message = "Cannot accept: conflicting booking already exists" });
            }

            // Update booking status
            booking.Status = BookingStatus.Accepted;
            booking.AcceptedAt = DateTime.UtcNow;
            booking.StatusReason = "Accepted by sitter";

            var updated = await bookingRepo.UpdateAsync(booking);

            // T113: Auto-update availability - mark dates as unavailable
            var availabilities = await availabilityRepo
                .GetBySitterAndDateRangeAsync(booking.PetSitterId, booking.StartDate, booking.EndDate);

            foreach (var availability in availabilities)
            {
                availability.IsAvailable = false;
                await availabilityRepo.UpdateAsync(availability);
            }

            return Results.Ok(new
            {
                updated.Id,
                updated.Status,
                updated.StatusReason,
                updated.AcceptedAt,
                message = "Booking accepted successfully and availability updated"
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to accept booking",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Decline a pending booking request with reason
    /// Phase 5: T110
    /// </summary>
    private static async Task<IResult> DeclineBooking(
        [FromServices] IBookingRepository repo,
        int id,
        [FromBody] DeclineBookingRequest request)
    {
        try
        {
            var booking = await repo.GetByIdAsync(id);

            if (booking == null)
            {
                return Results.NotFound(new { message = $"Booking with ID {id} not found" });
            }

            // T112: Validate status transition
            if (booking.Status != BookingStatus.Pending)
            {
                return Results.BadRequest(new { message = "Only pending bookings can be declined" });
            }

            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return Results.BadRequest(new { message = "Decline reason is required" });
            }

            // Update booking status
            booking.Status = BookingStatus.Declined;
            booking.StatusReason = request.Reason;
            booking.CancelledAt = DateTime.UtcNow;

            var updated = await repo.UpdateAsync(booking);

            return Results.Ok(new
            {
                updated.Id,
                updated.Status,
                updated.StatusReason,
                updated.CancelledAt
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to decline booking",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Cancel a booking with cancellation policy logic
    /// Phase 5: T111
    /// Applies refund based on timing: >24h = full refund, <24h = no refund
    /// </summary>
    private static async Task<IResult> CancelBooking(
        [FromServices] IBookingRepository bookingRepo,
        [FromServices] IAvailabilityRepository availabilityRepo,
        int id,
        [FromBody] CancelBookingRequest request)
    {
        try
        {
            var booking = await bookingRepo.GetByIdAsync(id);

            if (booking == null)
            {
                return Results.NotFound(new { message = $"Booking with ID {id} not found" });
            }

            // T112: Validate status transition
            if (booking.Status == BookingStatus.Completed)
            {
                return Results.BadRequest(new { message = "Cannot cancel completed bookings" });
            }

            if (booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.Declined)
            {
                return Results.BadRequest(new { message = "Booking is already cancelled" });
            }

            // Calculate refund based on cancellation policy (T111, T156)
            var hoursUntilStart = (booking.StartDate - DateTime.UtcNow).TotalHours;
            var refundAmount = hoursUntilStart >= 24 ? booking.TotalCost : 0;
            var refundPercentage = hoursUntilStart >= 24 ? 100 : 0;

            // Update booking status
            booking.Status = BookingStatus.Cancelled;
            booking.StatusReason = request.Reason ?? "Cancelled by user";
            booking.CancelledAt = DateTime.UtcNow;

            var updated = await bookingRepo.UpdateAsync(booking);

            // If booking was accepted, restore availability
            if (booking.Status == BookingStatus.Accepted)
            {
                var availabilities = await availabilityRepo
                    .GetBySitterAndDateRangeAsync(booking.PetSitterId, booking.StartDate, booking.EndDate);

                foreach (var availability in availabilities)
                {
                    availability.IsAvailable = true;
                    await availabilityRepo.UpdateAsync(availability);
                }
            }

            return Results.Ok(new
            {
                updated.Id,
                updated.Status,
                updated.StatusReason,
                updated.CancelledAt,
                refundAmount,
                refundPercentage,
                message = hoursUntilStart >= 24
                    ? "Booking cancelled with full refund"
                    : "Booking cancelled within 24 hours - no refund per policy"
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to cancel booking",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Create a new booking request
    /// Validates dates and checks sitter availability
    /// </summary>
    private static async Task<IResult> CreateBooking(
        [FromServices] IBookingRepository bookingRepo,
        [FromServices] IAvailabilityRepository availabilityRepo,
        [FromBody] CreateBookingRequest request)
    {
        try
        {
            // Validate dates are not in the past
            if (request.StartDate < DateTime.UtcNow.Date)
            {
                return Results.BadRequest(new { message = "Start date cannot be in the past" });
            }

            if (request.EndDate < request.StartDate)
            {
                return Results.BadRequest(new { message = "End date must be after start date" });
            }

            // Check sitter availability
            var availabilities = await availabilityRepo
                .GetBySitterAndDateRangeAsync(request.PetSitterId, request.StartDate, request.EndDate);

            if (!availabilities.All(a => a.IsAvailable))
            {
                return Results.BadRequest(new { message = "Sitter is not available for the selected dates" });
            }

            // Check for conflicting bookings
            var existingBookings = await bookingRepo.GetBySitterIdAsync(request.PetSitterId);
            var hasConflict = existingBookings.Any(b =>
                b.Status == BookingStatus.Accepted &&
                ((b.StartDate <= request.StartDate && b.EndDate >= request.StartDate) ||
                 (b.StartDate <= request.EndDate && b.EndDate >= request.EndDate) ||
                 (b.StartDate >= request.StartDate && b.EndDate <= request.EndDate)));

            if (hasConflict)
            {
                return Results.BadRequest(new { message = "Sitter has a conflicting booking for these dates" });
            }

            // Create booking
            var booking = new Booking
            {
                PetOwnerId = request.PetOwnerId,
                PetSitterId = request.PetSitterId,
                ServiceId = request.ServiceId,
                PetIds = request.PetIds.ToList(),
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                TotalCost = request.TotalCost,
                Status = BookingStatus.Pending,
                StatusReason = string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            var created = await bookingRepo.CreateAsync(booking);

            return Results.Created($"/api/bookings/{created.Id}", new
            {
                created.Id,
                created.PetOwnerId,
                created.PetSitterId,
                created.ServiceId,
                created.PetIds,
                created.StartDate,
                created.EndDate,
                created.TotalCost,
                created.Status,
                created.StatusReason,
                created.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to create booking",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Get booking details by ID
    /// </summary>
    private static async Task<IResult> GetBookingById(
        [FromServices] IBookingRepository repo,
        int id)
    {
        var booking = await repo.GetByIdAsync(id);

        if (booking == null)
        {
            return Results.NotFound(new { message = $"Booking with ID {id} not found" });
        }

        return Results.Ok(new
        {
            booking.Id,
            booking.PetOwnerId,
            booking.PetSitterId,
            booking.ServiceId,
            booking.PetIds,
            booking.StartDate,
            booking.EndDate,
            booking.TotalCost,
            booking.Status,
            booking.StatusReason,
            booking.CreatedAt,
            booking.AcceptedAt,
            booking.CompletedAt,
            booking.CancelledAt,
            OwnerName = booking.PetOwner?.Name,
            SitterName = booking.PetSitter?.Name,
            ServiceName = booking.Service?.Name
        });
    }

    /// <summary>
    /// Update booking status (accept/decline/cancel/complete)
    /// </summary>
    private static async Task<IResult> UpdateBookingStatus(
        [FromServices] IBookingRepository repo,
        int id,
        [FromBody] UpdateBookingStatusRequest request)
    {
        try
        {
            var booking = await repo.GetByIdAsync(id);

            if (booking == null)
            {
                return Results.NotFound(new { message = $"Booking with ID {id} not found" });
            }

            // Validate status transitions
            if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
            {
                return Results.BadRequest(new { message = "Cannot update status of completed or cancelled booking" });
            }

            // Update status
            booking.Status = request.Status;
            booking.StatusReason = request.StatusReason ?? string.Empty;

            switch (request.Status)
            {
                case BookingStatus.Accepted:
                    booking.AcceptedAt = DateTime.UtcNow;
                    break;
                case BookingStatus.Completed:
                    booking.CompletedAt = DateTime.UtcNow;
                    break;
                case BookingStatus.Cancelled:
                    booking.CancelledAt = DateTime.UtcNow;
                    break;
            }

            var updated = await repo.UpdateAsync(booking);

            return Results.Ok(new
            {
                updated.Id,
                updated.Status,
                updated.StatusReason,
                updated.AcceptedAt,
                updated.CompletedAt,
                updated.CancelledAt
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to update booking status",
                detail: ex.Message,
                statusCode: 500);
        }
    }
}

// DTOs
public record CreateBookingRequest(
    int PetOwnerId,
    int PetSitterId,
    int ServiceId,
    int[] PetIds,
    DateTime StartDate,
    DateTime EndDate,
    decimal TotalCost);

public record UpdateBookingStatusRequest(
    BookingStatus Status,
    string? StatusReason);

// Phase 5 DTOs
public record DeclineBookingRequest(string Reason);

public record CancelBookingRequest(string? Reason);
