/**
 * iCal/ICS file generation utility for exporting calendar events
 */

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}

/**
 * Format date for iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters for iCal format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a single iCal event
 */
function generateICalEvent(event: CalendarEvent): string {
  const now = new Date();
  const startDate = formatICalDate(event.startDate);
  const endDate = event.endDate ? formatICalDate(event.endDate) : formatICalDate(new Date(event.startDate.getTime() + 3600000)); // +1 hour default
  const timestamp = formatICalDate(now);
  
  let icalEvent = 'BEGIN:VEVENT\r\n';
  icalEvent += `UID:${event.id}@secret-santa-app\r\n`;
  icalEvent += `DTSTAMP:${timestamp}\r\n`;
  icalEvent += `DTSTART:${startDate}\r\n`;
  icalEvent += `DTEND:${endDate}\r\n`;
  icalEvent += `SUMMARY:${escapeICalText(event.title)}\r\n`;
  
  if (event.description) {
    icalEvent += `DESCRIPTION:${escapeICalText(event.description)}\r\n`;
  }
  
  if (event.location) {
    icalEvent += `LOCATION:${escapeICalText(event.location)}\r\n`;
  }
  
  icalEvent += 'END:VEVENT\r\n';
  
  return icalEvent;
}

/**
 * Generate complete iCal file content
 */
export function generateICalFile(events: CalendarEvent[]): string {
  let icalContent = 'BEGIN:VCALENDAR\r\n';
  icalContent += 'VERSION:2.0\r\n';
  icalContent += 'PRODID:-//Secret Santa App//Calendar Export//EN\r\n';
  icalContent += 'CALSCALE:GREGORIAN\r\n';
  icalContent += 'METHOD:PUBLISH\r\n';
  
  events.forEach(event => {
    icalContent += generateICalEvent(event);
  });
  
  icalContent += 'END:VCALENDAR\r\n';
  
  return icalContent;
}

/**
 * Download iCal file
 */
export function downloadICalFile(events: CalendarEvent[], filename: string = 'calendar.ics') {
  const icalContent = generateICalFile(events);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export a single event
 */
export function exportSingleEvent(event: CalendarEvent) {
  downloadICalFile([event], `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
}

/**
 * Export all events
 */
export function exportAllEvents(events: CalendarEvent[]) {
  downloadICalFile(events, 'secret_santa_calendar.ics');
}
