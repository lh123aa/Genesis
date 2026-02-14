/**
 * Date Parser Utility
 * 
 * Parses various date formats into structured date objects.
 * Handles ranges, relative dates, and different formats.
 */

export interface ParsedDate {
  startDate: Date | null;
  endDate: Date | null;
  display: string;
  isRange: boolean;
  isValid: boolean;
  year: number;
  precision: 'day' | 'month' | 'year' | 'unknown';
}

/**
 * Parse common date formats from web content
 */
export function parseEventDate(input: string, currentYear: number = new Date().getFullYear()): ParsedDate {
  const cleaned = input.trim();
  
  // Try different patterns
  let result = parseRangeDate(cleaned, currentYear);
  if (result.isValid) return result;
  
  result = parseSingleDate(cleaned, currentYear);
  if (result.isValid) return result;
  
  result = parseMonthYear(cleaned, currentYear);
  if (result.isValid) return result;
  
  // Return invalid result
  return {
    startDate: null,
    endDate: null,
    display: input,
    isRange: false,
    isValid: false,
    year: currentYear,
    precision: 'unknown',
  };
}

/**
 * Parse date range like "16-21 Feb" or "08-14 Feb, 2025"
 */
function parseRangeDate(input: string, defaultYear: number): ParsedDate {
  // Simple range: DD-DD Mon (e.g., "16-21 Feb")
  const simpleRange = /^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)$/i.exec(input);
  if (simpleRange) {
    const startDay = parseInt(simpleRange[1]);
    const endDay = parseInt(simpleRange[2]);
    const month = parseMonth(simpleRange[3]);
    if (month !== -1) {
      return {
        startDate: new Date(defaultYear, month, startDay),
        endDate: new Date(defaultYear, month, endDay),
        display: input,
        isRange: true,
        isValid: true,
        year: defaultYear,
        precision: 'day',
      };
    }
  }
  
  // Range with year: DD Mon - DD Mon, YYYY
  const rangeYearPattern = /^(\d{1,2})\s+([A-Za-z]+)\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+),?\s*(\d{4})$/i.exec(input);
  if (rangeYearPattern) {
    const startDay = parseInt(rangeYearPattern[1]);
    const startMonth = parseMonth(rangeYearPattern[2]);
    const endDay = parseInt(rangeYearPattern[3]);
    const endMonth = parseMonth(rangeYearPattern[4]);
    const year = parseInt(rangeYearPattern[5]);
    
    if (startMonth !== -1 && endMonth !== -1) {
      return {
        startDate: new Date(year, startMonth, startDay),
        endDate: new Date(year, endMonth, endDay),
        display: input,
        isRange: true,
        isValid: true,
        year,
        precision: 'day',
      };
    }
  }
  
  return invalidResult(input, defaultYear);
}

/**
 * Parse single date like "14 Feb" or "14 Feb, 2026"
 */
function parseSingleDate(input: string, defaultYear: number): ParsedDate {
  // With year: 14 Feb, 2026
  const withYear = /^(\d{1,2})\s+([A-Za-z]+),?\s*(\d{4})$/i.exec(input);
  if (withYear) {
    const day = parseInt(withYear[1]);
    const month = parseMonth(withYear[2]);
    const year = parseInt(withYear[3]);
    
    if (month !== -1 && day >= 1 && day <= 31) {
      return {
        startDate: new Date(year, month, day),
        endDate: new Date(year, month, day),
        display: input,
        isRange: false,
        isValid: true,
        year,
        precision: 'day',
      };
    }
  }
  
  // Without year: 14 Feb
  const withoutYear = /^(\d{1,2})\s+([A-Za-z]+)$/i.exec(input);
  if (withoutYear) {
    const day = parseInt(withoutYear[1]);
    const month = parseMonth(withoutYear[2]);
    
    if (month !== -1 && day >= 1 && day <= 31) {
      return {
        startDate: new Date(defaultYear, month, day),
        endDate: new Date(defaultYear, month, day),
        display: input,
        isRange: false,
        isValid: true,
        year: defaultYear,
        precision: 'day',
      };
    }
  }
  
  return invalidResult(input, defaultYear);
}

/**
 * Parse month range and year like "Apr - Jun 2026"
 */
function parseMonthYear(input: string, defaultYear: number): ParsedDate {
  // Range with year: Apr - Jun 2026
  const rangePattern = /^([A-Za-z]+)\s*[-–]\s*([A-Za-z]+)\s+(\d{4})$/i.exec(input);
  if (rangePattern) {
    const startMonth = parseMonth(rangePattern[1]);
    const endMonth = parseMonth(rangePattern[2]);
    const year = parseInt(rangePattern[3]);
    
    if (startMonth !== -1 && endMonth !== -1) {
      return {
        startDate: new Date(year, startMonth, 1),
        endDate: new Date(year, endMonth + 1, 0),
        display: input,
        isRange: true,
        isValid: true,
        year,
        precision: 'month',
      };
    }
  }
  
  // Single month with year: April 2026
  const singlePattern = /^([A-Za-z]+)\s+(\d{4})$/i.exec(input);
  if (singlePattern) {
    const month = parseMonth(singlePattern[1]);
    const year = parseInt(singlePattern[2]);
    if (month !== -1) {
      return {
        startDate: new Date(year, month, 1),
        endDate: new Date(year, month + 1, 0),
        display: input,
        isRange: false,
        isValid: true,
        year,
        precision: 'month',
      };
    }
  }
  
  return invalidResult(input, defaultYear);
}

/**
 * Parse month name to number (0-11)
 */
function parseMonth(monthStr: string): number {
  const months: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };
  
  return months[monthStr.toLowerCase()] ?? -1;
}

/**
 * Create invalid result
 */
function invalidResult(input: string, year: number): ParsedDate {
  return {
    startDate: null,
    endDate: null,
    display: input,
    isRange: false,
    isValid: false,
    year,
    precision: 'unknown',
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Check if date is in the future
 */
export function isUpcoming(parsed: ParsedDate): boolean {
  if (!parsed.startDate) return false;
  return parsed.startDate > new Date();
}

/**
 * Check if date is in a specific range
 */
export function isInRange(parsed: ParsedDate, start: Date, end: Date): boolean {
  if (!parsed.startDate) return false;
  return parsed.startDate >= start && parsed.startDate <= end;
}

export default {
  parseEventDate,
  formatDate,
  isUpcoming,
  isInRange,
};
