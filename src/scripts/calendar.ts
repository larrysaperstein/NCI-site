import { CALENDAR_CONFIG } from "../config/calendar";

export type CalendarEvent = {
  title: string;
  date: string;
  time: string;
  locationName: string;
  locationAddress: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  startDate: string;
};

const CACHE_KEY = "nci-calendar-events-v4";
const CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_BUTTON_TEXT = "Learn More";
const BUTTON_LINE_PATTERN = /^button:\s*(.+)$/i;

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function looksLikeUrl(value: string): boolean {
  return (
    /^https?:\/\//i.test(value) ||
    /^[a-z0-9][-a-z0-9.]*\.[a-z]{2,}(?:[/:?#].*)?$/i.test(value)
  );
}

function normalizeEventUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function parseButtonLine(line: string): { text: string; url: string } | null {
  const match = line.trim().match(BUTTON_LINE_PATTERN);
  if (!match) return null;

  const payload = match[1].trim();
  const pipeIndex = payload.indexOf("|");

  if (pipeIndex !== -1) {
    const text = payload.slice(0, pipeIndex).trim();
    const url = normalizeEventUrl(payload.slice(pipeIndex + 1).trim());
    if (!url) return null;
    return { text: text || DEFAULT_BUTTON_TEXT, url };
  }

  const colonMatch = payload.match(/^(.+?):\s*(.+)$/);
  if (colonMatch) {
    const label = colonMatch[1].trim();
    const urlPart = colonMatch[2].trim();
    if (looksLikeUrl(urlPart)) {
      const url = normalizeEventUrl(urlPart);
      if (url && label) return { text: label, url };
    }
  }

  if (looksLikeUrl(payload)) {
    const url = normalizeEventUrl(payload);
    if (url) return { text: DEFAULT_BUTTON_TEXT, url };
  }

  return null;
}

export function parseCalendarDescription(raw: string): {
  description: string;
  button?: { text: string; url: string };
} {
  if (!raw.trim()) {
    return { description: "" };
  }

  const lines = raw.split(/\r?\n/);
  let button: { text: string; url: string } | undefined;
  const descriptionLines: string[] = [];

  for (const line of lines) {
    const parsedButton = parseButtonLine(line);
    if (parsedButton && !button) {
      button = parsedButton;
      continue;
    }

    descriptionLines.push(line);
  }

  return {
    description: descriptionLines.join("\n").trim(),
    button,
  };
}

function fetchEvents(calendarApiUrl: string): Promise<CalendarEvent[]> {
  return fetch(calendarApiUrl, { redirect: "follow" })
    .then((response) =>
      response.text().then((text) => {
        let data: unknown;

        if (text.trim().startsWith("<")) {
          throw new Error(
            "Calendar API is not publicly accessible. Redeploy the Apps Script web app with Who has access set to Anyone."
          );
        }

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Calendar API returned invalid JSON");
        }

        if (data && typeof data === "object" && "error" in data) {
          throw new Error(String((data as { error: string }).error));
        }

        if (!Array.isArray(data)) {
          throw new Error("Calendar API returned unexpected data");
        }

        return data as CalendarEvent[];
      })
    )
    .then((data) => {
      const now = new Date();

      return data
        .map((event) => {
          const parsedDescription = parseCalendarDescription(event.description?.trim() ?? "");

          return {
            ...event,
            locationName: event.locationName ?? (event as CalendarEvent & { location?: string }).location ?? "",
            locationAddress: event.locationAddress ?? "",
            description: parsedDescription.description,
            button: parsedDescription.button,
          };
        })
        .filter((event) => new Date(event.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });
}

function getCachedEvents(): CalendarEvent[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { events?: CalendarEvent[]; timestamp?: number };
    if (!parsed?.events || typeof parsed.timestamp !== "number") return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;

    return parsed.events;
  } catch {
    return null;
  }
}

function setCachedEvents(events: CalendarEvent[]): void {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        events,
      })
    );
  } catch {
    /* ignore cache write errors */
  }
}

function fetchEventsWithRetry(calendarApiUrl: string, attemptsRemaining: number): Promise<CalendarEvent[]> {
  return fetchEvents(calendarApiUrl).catch((error) => {
    if (attemptsRemaining <= 1) throw error;

    return new Promise<void>((resolve) => {
      setTimeout(resolve, 600);
    }).then(() => fetchEventsWithRetry(calendarApiUrl, attemptsRemaining - 1));
  });
}

function renderLocation(event: CalendarEvent): string {
  if (!event.locationName && !event.locationAddress) {
    return "";
  }

  const nameMarkup = event.locationName
    ? `<p class="home-event-card__location-name">${escapeHtml(event.locationName)}</p>`
    : "";
  const addressMarkup = event.locationAddress
    ? `<p class="home-event-card__location-address"><em>${escapeHtml(event.locationAddress)}</em></p>`
    : "";

  return `<div class="home-event-card__location">${nameMarkup}${addressMarkup}</div>`;
}

function renderDescription(event: CalendarEvent): string {
  if (!event.description) {
    return "";
  }

  return `<p class="home-event-card__description">${escapeHtml(event.description)}</p>`;
}

function renderButton(event: CalendarEvent): string {
  if (!event.button) {
    return "";
  }

  return (
    `<p class="home-event-card__button">` +
    `<a class="button button--blue" href="${escapeHtml(event.button.url)}" target="_blank" rel="noopener noreferrer">` +
    `${escapeHtml(event.button.text)}</a>` +
    `</p>`
  );
}

function renderEventCard(event: CalendarEvent, headingTag: "h2" | "h3"): string {
  return (
    `<article class="home-event-card">` +
    `<${headingTag}>${escapeHtml(event.title)}</${headingTag}>` +
    `<p class="home-event-card__date">${escapeHtml(event.date)}</p>` +
    `<p class="home-event-card__time">${escapeHtml(event.time)}</p>` +
    renderLocation(event) +
    renderDescription(event) +
    renderButton(event) +
    `</article>`
  );
}

function renderEvents(gridEl: HTMLElement, events: CalendarEvent[], headingTag: "h2" | "h3"): void {
  if (!events.length) {
    gridEl.innerHTML =
      '<p class="home-events-empty">No upcoming events at this time. Check back soon!</p>';
    return;
  }

  gridEl.innerHTML = events.map((event) => renderEventCard(event, headingTag)).join("");
}

export function loadEventsIntoGrid(gridEl: HTMLElement): Promise<void> {
  const maxEventsAttr = gridEl.dataset.maxEvents;
  const parsedMaxEvents = maxEventsAttr ? Number.parseInt(maxEventsAttr, 10) : Number.NaN;
  const maxEvents = Number.isFinite(parsedMaxEvents) ? parsedMaxEvents : undefined;
  const headingTag = gridEl.dataset.headingTag === "h2" ? "h2" : "h3";
  const calendarApiUrl = CALENDAR_CONFIG.calendarApiUrl;

  if (!calendarApiUrl) {
    renderEvents(gridEl, [], headingTag);
    return Promise.resolve();
  }

  const cachedEvents = getCachedEvents();
  if (cachedEvents) {
    const cachedLimited =
      typeof maxEvents === "number" && Number.isFinite(maxEvents)
        ? cachedEvents.slice(0, maxEvents)
        : cachedEvents;
    renderEvents(gridEl, cachedLimited, headingTag);
  }

  return fetchEventsWithRetry(calendarApiUrl, 3)
    .then((events) => {
      setCachedEvents(events);
      const limited =
        typeof maxEvents === "number" && Number.isFinite(maxEvents)
          ? events.slice(0, maxEvents)
          : events;
      renderEvents(gridEl, limited, headingTag);
    })
    .catch((error) => {
      console.error("Failed to load calendar events:", error);
      if (!cachedEvents) {
        gridEl.innerHTML =
          '<p class="home-events-empty">Unable to load upcoming events right now. Please check back soon.</p>';
      }
    });
}

export function initCalendarGrids(): void {
  document.querySelectorAll<HTMLElement>("[data-events-grid]").forEach((gridEl) => {
    loadEventsIntoGrid(gridEl);
  });
}
