import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AvailabilityCalendar.css';

export interface AvailabilitySlot {
  id?: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
}

interface AvailabilityCalendarProps {
  sitterId: number;
  onSave?: (slots: AvailabilitySlot[]) => void;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

/**
 * AvailabilityCalendar Component
 * Allows sitters to manage their availability calendar
 */
export default function AvailabilityCalendar({ sitterId, onSave }: AvailabilityCalendarProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    loadAvailability();
  }, [sitterId]);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load availability for next 60 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);

      const response = await fetch(
        `${API_BASE_URL}/api/availability/${sitterId}?` +
        `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load availability: ${response.statusText}`);
      }

      const slots = await response.json();
      setAvailabilitySlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilitySlots.some(slot => {
      const slotStart = new Date(slot.startDate).toISOString().split('T')[0];
      const slotEnd = new Date(slot.endDate).toISOString().split('T')[0];
      return slot.isAvailable && dateStr >= slotStart && dateStr <= slotEnd;
    });
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(d => 
      d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  };

  const handleDateClick = (date: Date) => {
    // Prevent selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return;
    }

    const dateIndex = selectedDates.findIndex(d => 
      d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );

    if (dateIndex >= 0) {
      // Remove date
      setSelectedDates(prev => prev.filter((_, i) => i !== dateIndex));
    } else {
      // Add date
      setSelectedDates(prev => [...prev, date]);
    }
  };

  const handleMarkAvailable = async () => {
    if (selectedDates.length === 0) {
      setError('Please select dates to mark as available');
      return;
    }

    await updateAvailability(true);
  };

  const handleMarkUnavailable = async () => {
    if (selectedDates.length === 0) {
      setError('Please select dates to mark as unavailable');
      return;
    }

    await updateAvailability(false);
  };

  const updateAvailability = async (isAvailable: boolean) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Sort dates and create contiguous slots
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const slots: AvailabilitySlot[] = [];
      
      let currentSlot: AvailabilitySlot | null = null;
      
      for (const date of sortedDates) {
        if (!currentSlot) {
          currentSlot = {
            startDate: date.toISOString().split('T')[0],
            endDate: date.toISOString().split('T')[0],
            isAvailable
          };
        } else {
          const lastDate = new Date(currentSlot.endDate);
          lastDate.setDate(lastDate.getDate() + 1);
          
          if (lastDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
            // Extend current slot
            currentSlot.endDate = date.toISOString().split('T')[0];
          } else {
            // Save current slot and start new one
            slots.push(currentSlot);
            currentSlot = {
              startDate: date.toISOString().split('T')[0],
              endDate: date.toISOString().split('T')[0],
              isAvailable
            };
          }
        }
      }
      
      if (currentSlot) {
        slots.push(currentSlot);
      }

      // Send batch update
      const response = await fetch(`${API_BASE_URL}/api/availability/${sitterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slots),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update availability: ${errorText}`);
      }

      setSuccess(`Successfully marked ${selectedDates.length} date(s) as ${isAvailable ? 'available' : 'unavailable'}`);
      setSelectedDates([]);
      
      // Reload availability
      await loadAvailability();

      if (onSave) {
        onSave(slots);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedDates([]);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';

    const classes = [];
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      classes.push('past-date');
    }
    
    // Check if date is available
    if (isDateAvailable(date)) {
      classes.push('available-date');
    }
    
    // Check if date is selected
    if (isDateSelected(date)) {
      classes.push('selected-date');
    }
    
    return classes.join(' ');
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false;

    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) {
    return (
      <div className="availability-calendar">
        <div className="loading">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <h2>Manage Availability</h2>
        <p className="calendar-instructions">
          Click on dates to select them, then mark them as available or unavailable.
          Green dates are currently available.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="calendar-container">
        <Calendar
          value={viewDate}
          onClickDay={handleDateClick}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          minDetail="month"
          showNeighboringMonth={false}
        />
      </div>

      {selectedDates.length > 0 && (
        <div className="calendar-selection-info">
          <p>
            <strong>{selectedDates.length}</strong> date(s) selected
          </p>
        </div>
      )}

      <div className="calendar-actions">
        <button
          onClick={handleMarkAvailable}
          className="btn btn-success"
          disabled={saving || selectedDates.length === 0}
        >
          {saving ? 'Saving...' : 'Mark Available'}
        </button>
        
        <button
          onClick={handleMarkUnavailable}
          className="btn btn-warning"
          disabled={saving || selectedDates.length === 0}
        >
          {saving ? 'Saving...' : 'Mark Unavailable'}
        </button>
        
        <button
          onClick={handleClearSelection}
          className="btn btn-secondary"
          disabled={selectedDates.length === 0}
        >
          Clear Selection
        </button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-box available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-box selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-box past"></span>
          <span>Past/Unavailable</span>
        </div>
      </div>
    </div>
  );
}
