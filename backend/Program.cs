using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Repositories;
using Backend.Repositories.Interfaces;
using Backend.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire service discovery (commented out for standalone run)
// builder.AddServiceDefaults();

// Configure EF Core In-Memory Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("OctopetsMarketplace"));

// Register Repositories
builder.Services.AddScoped<IPetOwnerRepository, PetOwnerRepository>();
builder.Services.AddScoped<IPetSitterRepository, PetSitterRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IAvailabilityRepository, AvailabilityRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IPetRepository, PetRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// Add OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "Octopets Pet Sitter Marketplace API";
    config.Title = "Pet Sitter Marketplace API v1";
    config.Version = "v1";
});

// Configure CORS for frontend
var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

// Configure middleware
app.UseDefaultFiles();
app.UseStaticFiles();

// Enable CORS
app.UseCors();

// Map health check endpoint (commented out for standalone run)
// app.MapHealthChecks("/health");

// Enable Scalar/OpenAPI in development
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Commented out for standalone run - requires Scalar.AspNetCore package
    // app.MapScalarApiReference(options =>
    // {
    //     options.WithTitle("Pet Sitter Marketplace API")
    //            .WithTheme(ScalarTheme.Purple);
    // });
}

// Map service defaults (commented out for standalone run)
// app.MapDefaultEndpoints();

// Register marketplace endpoints
app.MapGroup("/api/search")
    .MapSearchEndpoints()
    .WithTags("Search");

app.MapGroup("/api/sitters")
    .MapPetSitterEndpoints()
    .WithTags("Sitters");

app.MapGroup("/api/bookings")
    .MapBookingEndpoints()
    .WithTags("Bookings");

app.MapGroup("/api/owners")
    .MapPetOwnerEndpoints()
    .WithTags("Owners");

app.MapGroup("/api/availability")
    .MapAvailabilityEndpoints()
    .WithTags("Availability");

// Phase 5: Message endpoints (T149)
app.MapGroup("/api/messages")
    .MapMessageEndpoints()
    .WithTags("Messages");

// Phase 6: Review endpoints (T157-T162)
app.MapReviewEndpoints();

app.Run();
