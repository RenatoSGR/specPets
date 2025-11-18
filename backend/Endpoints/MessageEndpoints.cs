using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Endpoints;

/// <summary>
/// Message endpoints for in-app communication between pet owners and sitters
/// Phase 5: User Story 3 - Messaging System (T114-T119)
/// </summary>
public static class MessageEndpoints
{
    public static RouteGroupBuilder MapMessageEndpoints(this RouteGroupBuilder group)
    {
        // T115: Send message
        group.MapPost("/", SendMessage)
            .WithName("SendMessage")
            .WithDescription("Send a message in a booking conversation")
            .WithOpenApi();

        // T116: Get messages for booking
        group.MapGet("/booking/{bookingId:int}", GetMessagesByBooking)
            .WithName("GetMessagesByBooking")
            .WithDescription("Get all messages for a specific booking")
            .WithOpenApi();

        // T117: Mark message as read
        group.MapPut("/{id:int}/read", MarkMessageAsRead)
            .WithName("MarkMessageAsRead")
            .WithDescription("Mark a message as read")
            .WithOpenApi();

        // T118: Get unread message count
        group.MapGet("/unread", GetUnreadMessageCount)
            .WithName("GetUnreadMessageCount")
            .WithDescription("Get count of unread messages for a user")
            .WithOpenApi();

        return group;
    }

    /// <summary>
    /// Send a message in a booking conversation
    /// Phase 5: T115
    /// T119: Includes message validation
    /// </summary>
    private static async Task<IResult> SendMessage(
        [FromServices] IMessageRepository messageRepo,
        [FromServices] IBookingRepository bookingRepo,
        [FromBody] SendMessageRequest request)
    {
        try
        {
            // Validate booking exists
            var booking = await bookingRepo.GetByIdAsync(request.BookingId);
            if (booking == null)
            {
                return Results.NotFound(new { message = $"Booking with ID {request.BookingId} not found" });
            }

            // T155: Validate messaging only available for confirmed bookings
            if (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Declined)
            {
                return Results.BadRequest(new { message = "Messaging is only available for accepted bookings" });
            }

            // T119: Validate message content
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return Results.BadRequest(new { message = "Message content cannot be empty" });
            }

            if (request.Content.Length > 1000)
            {
                return Results.BadRequest(new { message = "Message content cannot exceed 1000 characters" });
            }

            // Validate sender is part of the booking
            if (request.SenderId != booking.PetOwnerId && request.SenderId != booking.PetSitterId)
            {
                return Results.BadRequest(new { message = "Sender must be part of this booking" });
            }

            // Determine sender type
            var senderType = request.SenderId == booking.PetOwnerId ? "Owner" : "Sitter";

            // Create message
            var message = new Message
            {
                BookingId = request.BookingId,
                SenderId = request.SenderId,
                SenderType = senderType,
                Content = request.Content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            var created = await messageRepo.CreateAsync(message);

            return Results.Created($"/api/messages/{created.Id}", new
            {
                created.Id,
                created.BookingId,
                created.SenderId,
                created.Content,
                created.SentAt,
                created.IsRead,
                created.SenderType
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to send message",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Get all messages for a specific booking
    /// Phase 5: T116
    /// Returns messages in chronological order
    /// </summary>
    private static async Task<IResult> GetMessagesByBooking(
        [FromServices] IMessageRepository messageRepo,
        [FromServices] IBookingRepository bookingRepo,
        int bookingId)
    {
        try
        {
            // Validate booking exists
            var booking = await bookingRepo.GetByIdAsync(bookingId);
            if (booking == null)
            {
                return Results.NotFound(new { message = $"Booking with ID {bookingId} not found" });
            }

            var messages = await messageRepo.GetByBookingIdAsync(bookingId);

            var messageList = messages
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.BookingId,
                    m.SenderId,
                    m.Content,
                    m.SentAt,
                    m.IsRead,
                    m.SenderType,
                    SenderRole = m.SenderId == booking.PetOwnerId ? "Owner" : "Sitter"
                })
                .ToList();

            return Results.Ok(messageList);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to retrieve messages",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Mark a message as read
    /// Phase 5: T117, T143
    /// </summary>
    private static async Task<IResult> MarkMessageAsRead(
        [FromServices] IMessageRepository repo,
        int id)
    {
        try
        {
            var message = await repo.GetByIdAsync(id);

            if (message == null)
            {
                return Results.NotFound(new { message = $"Message with ID {id} not found" });
            }

            if (message.IsRead)
            {
                return Results.Ok(new { message = "Message already marked as read" });
            }

            message.IsRead = true;
            var updated = await repo.UpdateAsync(message);

            return Results.Ok(new
            {
                updated.Id,
                updated.IsRead,
                message = "Message marked as read"
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to mark message as read",
                detail: ex.Message,
                statusCode: 500);
        }
    }

    /// <summary>
    /// Get count of unread messages for a user
    /// Phase 5: T118, T144
    /// </summary>
    private static async Task<IResult> GetUnreadMessageCount(
        [FromServices] IMessageRepository messageRepo,
        [FromServices] IBookingRepository bookingRepo,
        [FromQuery] int? userId)
    {
        try
        {
            if (!userId.HasValue)
            {
                return Results.BadRequest(new { message = "userId query parameter is required" });
            }

            // Get all bookings where user is participant
            var ownerBookings = await bookingRepo.GetByOwnerIdAsync(userId.Value);
            var sitterBookings = await bookingRepo.GetBySitterIdAsync(userId.Value);
            var allBookingIds = ownerBookings.Concat(sitterBookings)
                .Select(b => b.Id)
                .Distinct()
                .ToList();

            // Count unread messages in user's bookings where they are NOT the sender
            int unreadCount = 0;
            foreach (var bookingId in allBookingIds)
            {
                var messages = await messageRepo.GetByBookingIdAsync(bookingId);
                unreadCount += messages.Count(m => !m.IsRead && m.SenderId != userId.Value);
            }

            return Results.Ok(new
            {
                userId = userId.Value,
                unreadCount,
                hasUnread = unreadCount > 0
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Failed to get unread message count",
                detail: ex.Message,
                statusCode: 500);
        }
    }
}

// DTOs
public record SendMessageRequest(
    int BookingId,
    int SenderId,
    string Content);
