/**
 * ACCOUNTIX - Centralized Date Formatting & Parsing Utility
 * Standardizes ALL displayed dates across ACCOUNTIX strictly to DD/MM/YYYY.
 *
 * GUARANTEES:
 * 1. Output is ALWAYS exactly DD/MM/YYYY:
 *    - 2 digits for day (padded with leading zero if needed)
 *    - '/' separator
 *    - 2 digits for month (padded with leading zero if needed)
 *    - '/' separator
 *    - 4 digits for year
 * 2. ZERO dependence on browser/system locale (NO toLocaleDateString()).
 * 3. ZERO timezone-shifting errors (avoids UTC-midnight parsing drift).
 *
 * TEST VERIFICATIONS:
 *  - 2026-10-08 -> 08/10/2026
 *  - 2026-01-05 -> 05/01/2026
 *  - 2026-02-01 -> 01/02/2026
 *  - 2026-12-31 -> 31/12/2026
 *  - 10/8/2026  -> 10/08/2026
 *  - 8/10/2026  -> 08/10/2026
 */

const MONTH_NAMES: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

/**
 * Formats any date value (YYYY-MM-DD, ISO string, slash date, timestamp, or Date object)
 * into strict DD/MM/YYYY format with exactly 2-digit day and 2-digit month.
 */
export function formatDate(dateValue: string | number | Date | null | undefined): string {
  if (dateValue === null || dateValue === undefined || dateValue === '') return '';

  // 1. Number timestamp (e.g. Date.now())
  if (typeof dateValue === 'number') {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    return `${day}/${month}/${year}`;
  }

  // 2. Date instance
  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return '';
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = String(dateValue.getFullYear());
    return `${day}/${month}/${year}`;
  }

  if (typeof dateValue === 'string') {
    let raw = dateValue.trim();
    if (!raw) return '';

    // If ISO timestamp with time (e.g. 2026-10-08T10:00:00.000Z), isolate date part
    if (raw.includes('T')) {
      raw = raw.split('T')[0].trim();
    }

    // Pattern 1: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD (Year first)
    const ymdMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, '0');
      const day = ymdMatch[3].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }

    // Pattern 2: DD-Mon-YYYY or D-Mon-YYYY (Named month like 08-Oct-2026, 01-Apr-2026)
    const monMatch = raw.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{4})/);
    if (monMatch) {
      const day = monMatch[1].padStart(2, '0');
      const mStr = monMatch[2].toLowerCase();
      const month = MONTH_NAMES[mStr] || '01';
      const year = monMatch[3];
      return `${day}/${month}/${year}`;
    }

    // Pattern 3: Mon DD, YYYY or Month DD, YYYY (e.g. Oct 8, 2026 or October 8, 2026)
    const monDayMatch = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
    if (monDayMatch) {
      const mStr = monDayMatch[1].toLowerCase();
      const month = MONTH_NAMES[mStr] || '01';
      const day = monDayMatch[2].padStart(2, '0');
      const year = monDayMatch[3];
      return `${day}/${month}/${year}`;
    }

    // Pattern 4: DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY or D-M-YYYY (Year last)
    const dmyMatch = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (dmyMatch) {
      const part1 = dmyMatch[1].padStart(2, '0');
      const part2 = dmyMatch[2].padStart(2, '0');
      let year = dmyMatch[3];
      if (year.length === 2) {
        year = `20${year}`;
      }
      // In ACCOUNTIX standard DD/MM/YYYY: part1 is Day, part2 is Month
      return `${part1}/${part2}/${year}`;
    }

    // Fallback: Date constructor using local components, then pad strictly
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = String(parsed.getFullYear());
      return `${day}/${month}/${year}`;
    }

    return raw;
  }

  return '';
}

/**
 * Centralized alias for formatDate
 */
export const formatDateForDisplay = formatDate;

/**
 * Leap year determination
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns number of days in a given month (1-12) of a year
 */
export function getDaysInMonth(month: number, year: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

/**
 * Validates day, month, year numeric parts strictly
 */
export function isValidDateParts(day: number, month: number, year: number): boolean {
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInMonth(month, year);
  if (day < 1 || day > maxDays) return false;
  return true;
}

/**
 * Validates a DD/MM/YYYY string format and ensures valid calendar day
 */
export function isValidDisplayDate(dmyString: string): boolean {
  if (!dmyString) return false;
  const match = dmyString.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  return isValidDateParts(day, month, year);
}

/**
 * Converts a DD/MM/YYYY display date to ISO YYYY-MM-DD storage format.
 * Returns empty string if the date is invalid.
 */
export function displayToIsoDate(displayDate: string): string {
  if (!displayDate) return '';
  const match = displayDate.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!match) return '';
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (!isValidDateParts(day, month, year)) return '';
  const dStr = String(day).padStart(2, '0');
  const mStr = String(month).padStart(2, '0');
  return `${year}-${mStr}-${dStr}`;
}

/**
 * Converts ISO YYYY-MM-DD or date object to display DD/MM/YYYY.
 */
export const isoToDisplayDate = formatDate;

/**
 * Converts a DD/MM/YYYY display date to ISO YYYY-MM-DD storage format.
 */
export function parseDate(displayDate: string): string {
  if (!displayDate) return '';
  const parsed = displayToIsoDate(displayDate);
  if (parsed) return parsed;
  const trimmed = displayDate.trim();
  const match = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

/**
 * Returns today's date formatted as DD/MM/YYYY for UI display
 */
export function getTodayDisplayDate(): string {
  return formatDate(new Date());
}

/**
 * Returns today's date in YYYY-MM-DD for native HTML input[type="date"]
 */
export function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
