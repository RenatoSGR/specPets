using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews")
            .WithTags("Reviews")
            .WithOpenApi();

        // POST /api/reviews - Submit a review
        group.MapPost("/", async (
            [FromBody] CreateReviewRequest request,
            [FromServices] IReviewRepository reviewRepo,
            [FromServices] IBookingRepository bookingRepo,
            [FromServices] ILogger<Program> logger) =>
        {
            logger.LogInformation("Review submission started for BookingId: {BookingId}, Rating: {Rating}", 
                request.BookingId, request.Rating);

            // Validate booking exists and is completed
            var booking = await bookingRepo.GetByIdAsync(request.BookingId);
            if (booking == null)
            {
                logger.LogWarning("Review submission failed - Booking not found: {BookingId}", request.BookingId);
                return Results.NotFound(new { message = "Booking not found" });
            }

            if (booking.Status != BookingStatus.Completed)
            {
                logger.LogWarning("Review submission failed - Booking not completed: {BookingId}, Status: {Status}", 
                    request.BookingId, booking.Status);
                return Results.BadRequest(new { message = "Reviews can only be submitted for completed bookings" });
            }

            // Check if review already exists for this booking
            var existingReview = await reviewRepo.GetByBookingIdAsync(request.BookingId);
            if (existingReview != null)
            {
                logger.LogWarning("Review submission failed - Review already exists: {BookingId}, ReviewId: {ReviewId}", 
                    request.BookingId, existingReview.Id);
                return Results.BadRequest(new { message = "A review has already been submitted for this booking" });
            }

            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
            {
                logger.LogWarning("Review submission failed - Invalid rating: {BookingId}, Rating: {Rating}", 
                    request.BookingId, request.Rating);
                return Results.BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            // Validate comment length
            if (string.IsNullOrWhiteSpace(request.Comment))
            {
                logger.LogWarning("Review submission failed - Empty comment: {BookingId}", request.BookingId);
                return Results.BadRequest(new { message = "Review comment is required" });
            }

            if (request.Comment.Length > 1000)
            {
                logger.LogWarning("Review submission failed - Comment too long: {BookingId}, Length: {Length}", 
                    request.BookingId, request.Comment.Length);
                return Results.BadRequest(new { message = "Review comment cannot exceed 1000 characters" });
            }

            var review = new Review
            {
                Id = Guid.NewGuid().ToString(),
                OwnerId = booking.PetOwnerId,
                SitterId = booking.PetSitterId,
                BookingId = request.BookingId,
                Rating = request.Rating,
                Comment = request.Comment.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            var created = await reviewRepo.CreateAsync(review);
            
            logger.LogInformation("Review created successfully: ReviewId: {ReviewId}, SitterId: {SitterId}, BookingId: {BookingId}, Rating: {Rating}", 
                created.Id, created.SitterId, created.BookingId, created.Rating);

            return Results.Created($"/api/reviews/{created.Id}", new
            {
                id = created.Id,
                ownerId = created.OwnerId,
                sitterId = created.SitterId,
                bookingId = created.BookingId,
                rating = created.Rating,
                comment = created.Comment,
                createdAt = created.CreatedAt
            });
        })
        .WithName("CreateReview")
        .WithDescription("Submit a review for a completed booking");

        // GET /api/reviews/sitter/{sitterId} - Get reviews for a sitter with pagination
        group.MapGet("/sitter/{sitterId:int}", async (
            int sitterId,
            int skip,
            int take,
            [FromServices] IReviewRepository reviewRepo,
            [FromServices] IPetSitterRepository sitterRepo,
            [FromServices] ILogger<Program> logger) =>
        {
            logger.LogInformation("Fetching reviews for SitterId: {SitterId}, Skip: {Skip}, Take: {Take}", 
                sitterId, skip, take);

            // Validate sitter exists
            var sitter = await sitterRepo.GetByIdAsync(sitterId);
            if (sitter == null)
            {
                logger.LogWarning("Reviews fetch failed - Sitter not found: {SitterId}", sitterId);
                return Results.NotFound(new { message = "Pet sitter not found" });
            }

            // Set default pagination
            skip = skip < 0 ? 0 : skip;
            take = take <= 0 || take > 50 ? 10 : take;

            var reviews = await reviewRepo.GetBySitterIdAsync(sitterId, skip, take);
            var totalCount = await reviewRepo.GetReviewCountAsync(sitterId);
            var averageRating = await reviewRepo.GetAverageRatingAsync(sitterId);

            logger.LogInformation("Reviews fetched successfully: SitterId: {SitterId}, Count: {Count}, TotalCount: {TotalCount}, AvgRating: {AvgRating}", 
                sitterId, reviews.Count(), totalCount, averageRating);

            return Results.Ok(new
            {
                sitterId,
                averageRating,
                totalCount,
                skip,
                take,
                reviews = reviews.Select(r => new
                {
                    id = r.Id,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    ownerName = r.Owner.Name,
                    ownerId = r.OwnerId
                })
            });
        })
        .WithName("GetSitterReviews")
        .WithDescription("Get all reviews for a specific pet sitter with pagination");

        // GET /api/reviews/booking/{bookingId} - Get review for a specific booking
        group.MapGet("/booking/{bookingId:int}", async (
            int bookingId,
            [FromServices] IReviewRepository reviewRepo,
            [FromServices] ILogger<Program> logger) =>
        {
            logger.LogInformation("Fetching review for BookingId: {BookingId}", bookingId);
            
            var review = await reviewRepo.GetByBookingIdAsync(bookingId);
            
            if (review == null)
            {
                logger.LogInformation("No review found for BookingId: {BookingId}", bookingId);
                return Results.NotFound(new { message = "No review found for this booking" });
            }

            logger.LogInformation("Review found for BookingId: {BookingId}, ReviewId: {ReviewId}", bookingId, review.Id);
            return Results.Ok(new
            {
                id = review.Id,
                bookingId = review.BookingId,
                rating = review.Rating,
                comment = review.Comment,
                createdAt = review.CreatedAt,
                ownerName = review.Owner.Name,
                sitterName = review.Sitter.Name
            });
        })
        .WithName("GetBookingReview")
        .WithDescription("Get the review for a specific booking");

        // GET /api/reviews/sitter/{sitterId}/stats - Get rating statistics for a sitter
        group.MapGet("/sitter/{sitterId:int}/stats", async (
            int sitterId,
            [FromServices] IReviewRepository reviewRepo,
            [FromServices] IPetSitterRepository sitterRepo,
            [FromServices] ILogger<Program> logger) =>
        {
            logger.LogInformation("Fetching review stats for SitterId: {SitterId}", sitterId);
            
            // Validate sitter exists
            var sitter = await sitterRepo.GetByIdAsync(sitterId);
            if (sitter == null)
            {
                logger.LogWarning("Stats fetch failed - Sitter not found: {SitterId}", sitterId);
                return Results.NotFound(new { message = "Pet sitter not found" });
            }

            var averageRating = await reviewRepo.GetAverageRatingAsync(sitterId);
            var totalCount = await reviewRepo.GetReviewCountAsync(sitterId);

            logger.LogInformation("Stats fetched successfully: SitterId: {SitterId}, TotalReviews: {TotalReviews}, AvgRating: {AvgRating}", 
                sitterId, totalCount, averageRating);

            return Results.Ok(new
            {
                sitterId,
                averageRating,
                totalReviews = totalCount
            });
        })
        .WithName("GetSitterRatingStats")
        .WithDescription("Get rating statistics (average and count) for a sitter");

        // GET /api/reviews/{id} - Get a specific review by ID
        group.MapGet("/{id}", async (
            string id,
            [FromServices] IReviewRepository reviewRepo,
            [FromServices] ILogger<Program> logger) =>
        {
            logger.LogInformation("Fetching review by ReviewId: {ReviewId}", id);
            
            var review = await reviewRepo.GetByIdAsync(id);
            
            if (review == null)
            {
                logger.LogWarning("Review not found: ReviewId: {ReviewId}", id);
                return Results.NotFound(new { message = "Review not found" });
            }

            logger.LogInformation("Review found: ReviewId: {ReviewId}, SitterId: {SitterId}, BookingId: {BookingId}", 
                review.Id, review.SitterId, review.BookingId);

            return Results.Ok(new
            {
                id = review.Id,
                ownerId = review.OwnerId,
                sitterId = review.SitterId,
                bookingId = review.BookingId,
                rating = review.Rating,
                comment = review.Comment,
                createdAt = review.CreatedAt,
                ownerName = review.Owner.Name,
                sitterName = review.Sitter.Name
            });
        })
        .WithName("GetReview")
        .WithDescription("Get a specific review by ID");
    }
}

public record CreateReviewRequest(
    int BookingId,
    int Rating,
    string Comment
);
