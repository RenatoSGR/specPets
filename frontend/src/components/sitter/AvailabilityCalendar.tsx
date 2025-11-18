import React, { useState } from 'react';
// import type { Availability } from '../../data/sitterService';
type Availability = any; // TODO: Define proper Availability type

interface AvailabilityCalendarProps {
  availability: Availability[];
}

/**
 * AvailabilityCalendar Component
 * Calendar view of sitter availability
 */
export default function AvailabilityCalendar({ availability }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Create availability lookup map for quick checking
  const availabilityMap = new Map<string, boolean>();
  availability.forEach(a => {
    const dateKey = new Date(a.date).toISOString().split('T')[0];
    availabilityMap.set(dateKey, a.isAvailable);
  });

  // Get days in current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getDayAvailability = (day: number): string => {
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().split('T')[0];
    const isAvailable = availabilityMap.get(dateKey);
    
    if (isAvailable === undefined) return 'unknown';
    return isAvailable ? 'available' : 'unavailable';
  };

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">
          ‹
        </button>
        <h3>{monthName}</h3>
        <button onClick={goToNextMonth} className="calendar-nav-btn">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              day ? `day-${getDayAvailability(day)}` : 'day-empty'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color legend-available"></span>
          <span className="legend-label">Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color legend-unavailable"></span>
          <span className="legend-label">Unavailable</span>
        </div>
      </div>
    </div>
  );
}
