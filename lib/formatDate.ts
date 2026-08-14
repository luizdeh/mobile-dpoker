// Dates from Supabase are stored as UTC ("2026-02-14T00:00:00+00:00"). Going
// through `new Date(str).toLocaleDateString()` converts that instant into the
// viewer's local timezone, which rolls it back a day for anyone west of UTC
// (e.g. Brazil, UTC-3, sees 13/02 instead of 14/02). Pull the calendar date
// straight out of the string instead of treating it as a point in time.
export const formatDateBR = (date: string | Date): string => {
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const todayBR = (): string => formatDateBR(new Date());

// Converts a "DD/MM/YYYY" string (as typed into a date Input) into
// "YYYY-MM-DD" for sending to Supabase. Falls back to the raw value if it
// doesn't look like a BR date, so a malformed edit just fails at the DB
// instead of silently mangling something else.
export const parseBRDateToISO = (value: string): string => {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return value;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};
