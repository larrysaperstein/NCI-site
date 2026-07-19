/**
 * Nature Coast Indivisible — Calendar Events API
 *
 * SETUP (one-time):
 * 1. Set CALENDAR_ID below to your NCI Google Calendar ID
 * 2. In Apps Script left sidebar: Services (+) → Google Calendar API → Add
 * 3. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 4. Copy the /exec URL into src/config/calendar.ts on the site
 *
 * Event fields:
 * - Title → event card title
 * - Location → first line or text before comma = name; remainder = italic address
 * - Description → shown below location on event cards
 * - End time → shown as a range when present (e.g. 1:00pm - 2:00pm)
 * - Timezone on each event → used for date/time display
 */

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

/**
 * Your Google Calendar ID.
 * Google Calendar → Settings → your calendar → Integrate calendar → Calendar ID
 */
const CALENDAR_ID = 'primary';

/** Used only when an event has no timezone set */
const FALLBACK_TIMEZONE = 'America/New_York';

// ---------------------------------------------------------------------------
// Web App entry point
// ---------------------------------------------------------------------------

function doGet() {
  try {
    const events = getUpcomingEvents();

    return ContentService
      .createTextOutput(JSON.stringify(events))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ---------------------------------------------------------------------------
// Fetch events — uses Advanced Calendar API for per-event timezones
// ---------------------------------------------------------------------------

function getUpcomingEvents() {
  if (typeof Calendar === 'undefined' || !Calendar.Events) {
    throw new Error(
      'Google Calendar API service is not enabled. In Apps Script, click Services (+) and add Google Calendar API.'
    );
  }

  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const response = Calendar.Events.list(CALENDAR_ID, {
    timeMin: now.toISOString(),
    timeMax: oneYearFromNow.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  });

  const items = response.items || [];

  return items.map(formatApiEvent);
}

function formatApiEvent(item) {
  const isAllDay = Boolean(item.start.date);
  const timeZone = item.start.timeZone || FALLBACK_TIMEZONE;
  const startValue = isAllDay ? item.start.date : item.start.dateTime;
  const start = new Date(startValue);
  const locationFields = formatLocationFields(item);

  return {
    date: formatDate(start, timeZone),
    time: formatTimeRange(item, timeZone),
    title: item.summary || '',
    locationName: locationFields.locationName,
    locationAddress: locationFields.locationAddress,
    description: formatDescription(item.description),
    startDate: start.toISOString(),
    timeZone: timeZone,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers — matches NCI site cards (Aug 12th, 2026 / 6:30 PM)
// ---------------------------------------------------------------------------

function formatDate(date, timeZone) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const monthIndex = parseInt(Utilities.formatDate(date, timeZone, 'M'), 10) - 1;
  const day = parseInt(Utilities.formatDate(date, timeZone, 'd'), 10);
  const year = Utilities.formatDate(date, timeZone, 'yyyy');

  return months[monthIndex] + ' ' + day + getOrdinalSuffix(day) + ', ' + year;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatTime(date, timeZone) {
  return Utilities.formatDate(date, timeZone, 'h:mma').toLowerCase();
}

function formatTimeRange(item, timeZone) {
  const isAllDay = Boolean(item.start.date);

  if (isAllDay) {
    return 'All day';
  }

  const start = new Date(item.start.dateTime);
  const endValue = item.end && item.end.dateTime;

  if (!endValue) {
    return formatTime(start, timeZone);
  }

  const end = new Date(endValue);
  const startFormatted = formatTime(start, timeZone);
  const endFormatted = formatTime(end, timeZone);

  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  return startFormatted + ' - ' + endFormatted;
}

// ---------------------------------------------------------------------------
// Location — name on one line, address on the next
// ---------------------------------------------------------------------------

function formatLocationFields(item) {
  const location = (item.location || '').trim();

  if (!location) {
    return { locationName: '', locationAddress: '' };
  }

  if (/^https?:\/\//i.test(location)) {
    return { locationName: 'Virtual Event', locationAddress: '' };
  }

  if (location.indexOf('\n') !== -1) {
    const lines = location
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(Boolean);

    return {
      locationName: lines[0] || '',
      locationAddress: lines.slice(1).join(', '),
    };
  }

  const commaIndex = location.indexOf(',');

  if (commaIndex !== -1) {
    return {
      locationName: location.slice(0, commaIndex).trim(),
      locationAddress: location.slice(commaIndex + 1).trim(),
    };
  }

  return { locationName: location, locationAddress: '' };
}

// ---------------------------------------------------------------------------
// Description — plain text for event cards
// ---------------------------------------------------------------------------

function formatDescription(rawDescription) {
  if (!rawDescription) {
    return '';
  }

  return stripHtml(String(rawDescription)).trim();
}

function stripHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// Manual tests
// ---------------------------------------------------------------------------

function testGetUpcomingEvents() {
  const events = getUpcomingEvents();
  const output = {
    calendarId: CALENDAR_ID,
    fallbackTimezone: FALLBACK_TIMEZONE,
    count: events.length,
    events: events,
  };

  Logger.log(JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
  return output;
}

function testDoGet() {
  const output = doGet().getContent();

  Logger.log(output);
  console.log(output);
  return output;
}
