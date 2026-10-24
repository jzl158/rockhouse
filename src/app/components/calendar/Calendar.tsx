'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarEvent, fetchCalendarEvents, updateJobAssignment, updateAvailability } from './calendarHelpers';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { toast } from 'sonner';

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      
      const end = new Date();
      end.setMonth(end.getMonth() + 2);
      
      const calendarEvents = await fetchCalendarEvents(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast.error('Failed to load calendar events');
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const event = arg.event;
    toast(event.title, {
      description: event.extendedProps.description || 'No additional details',
    });
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    try {
      const event = arg.event;
      const eventType = event.extendedProps.type;
      const eventId = event.id.split('-')[1]; // Remove prefix (job- or availability-)

      if (eventType === 'job') {
        await updateJobAssignment(eventId, {
          start_time: event.start?.toISOString(),
          end_time: event.end?.toISOString(),
        });
      } else if (eventType === 'availability') {
        await updateAvailability(eventId, {
          date: event.start?.toISOString().split('T')[0],
          start_time: event.start?.toISOString().split('T')[1].substring(0, 8),
          end_time: event.end?.toISOString().split('T')[1].substring(0, 8),
        });
      }

      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      arg.revert();
      toast.error('Failed to update event');
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        height="100%"
      />
    </div>
  );
}