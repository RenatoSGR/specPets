import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../data/bookingService';
import type { Service } from '../../data/sitterService';

interface BookingFormProps {
  sitterId: number;
  services: Service[];
  onCancel: () => void;
}

/**
 * BookingForm Component
 * Form for creating a new booking request
 */
export default function BookingForm({ sitterId, services, onCancel }: BookingFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    startDate: '',
    endDate: '',
    specialInstructions: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll use a placeholder owner ID
  // In real app, this would come from authentication context
  const DEMO_OWNER_ID = 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const booking = await createBooking({
        petOwnerId: DEMO_OWNER_ID,
        petSitterId: sitterId,
        petIds: [1], // TODO: Get from pet selection
        serviceId: parseInt(formData.serviceId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalCost: 0 // TODO: Calculate from service
      });

      // Navigate to booking confirmation page
      navigate(`/bookings/${booking.id}`, { state: { booking } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-form">
      <h3>Request a Booking</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="petId">
            Select Pet
            <span className="required">*</span>
          </label>
          <select
            id="petId"
            value={formData.petId}
            onChange={(e) => handleChange('petId', e.target.value)}
            required
          >
            <option value="">Choose a pet</option>
            <option value="pet-1">Max (Dog)</option>
            <option value="pet-2">Luna (Cat)</option>
            <option value="pet-3">Charlie (Dog)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serviceId">
            Service Type
            <span className="required">*</span>
          </label>
          <select
            id="serviceId"
            value={formData.serviceId}
            onChange={(e) => handleChange('serviceId', e.target.value)}
            required
          >
            <option value="">Choose a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">
            Start Date
            <span className="required">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            min={today}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">
            End Date
            <span className="required">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            min={formData.startDate || today}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialInstructions">
            Special Instructions
          </label>
          <textarea
            id="specialInstructions"
            value={formData.specialInstructions}
            onChange={(e) => handleChange('specialInstructions', e.target.value)}
            placeholder="Any special care instructions for your pet..."
            rows={4}
          />
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
