/**
 * ACCOUNTIX - Centralized Date Picker Component
 * Enforces strict DD/MM/YYYY visible format across all ACCOUNTIX forms.
 *
 * GUARANTEES:
 * 1. Visible input ALWAYS displays DD/MM/YYYY (e.g. "08/10/2026", never "10/08/2026").
 * 2. Internal/stored value is standard YYYY-MM-DD (e.g. "2026-10-08").
 * 3. Supports direct keyboard typing with strict date validation (prevents 32/13/2026, 00/10/2026, 08/00/2026).
 * 4. Includes interactive Calendar Picker dropdown styled with ACCOUNTIX blue theme.
 * 5. Zero reliance on browser locale, toLocaleDateString(), or OS settings.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import {
  formatDate,
  displayToIsoDate,
  isValidDisplayDate,
  getDaysInMonth,
} from '../../utils/dateUtils';

export interface AccountixDatePickerProps {
  value: string; // ISO date string: YYYY-MM-DD (e.g. '2026-10-08')
  onChange: (isoDate: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  autoFocus?: boolean;
}

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AccountixDatePicker: React.FC<AccountixDatePickerProps> = ({
  value,
  onChange,
  id,
  name,
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  required = false,
  className = '',
  minDate,
  maxDate,
  autoFocus = false,
}) => {
  // 1. Text input state (visible strictly as DD/MM/YYYY)
  const [displayValue, setDisplayValue] = useState<string>(() => formatDate(value));
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 2. Calendar popover state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  // Calendar navigation state (year & month, 0-indexed month)
  const initialYear = value && value.includes('-') ? parseInt(value.split('-')[0], 10) : new Date().getFullYear();
  const initialMonth = value && value.includes('-') ? parseInt(value.split('-')[1], 10) - 1 : new Date().getMonth();
  const [navYear, setNavYear] = useState<number>(isNaN(initialYear) ? 2026 : initialYear);
  const [navMonth, setNavMonth] = useState<number>(isNaN(initialMonth) ? 9 : initialMonth);

  // Sync display value when incoming value prop changes
  useEffect(() => {
    const formatted = formatDate(value);
    setDisplayValue(formatted);
    setIsInvalid(false);
    setErrorMessage('');

    if (value && value.includes('-')) {
      const parts = value.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setNavYear(y);
        setNavMonth(m);
      }
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-format user typing (insert '/' automatically when entering numbers)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Allow only digits and slashes
    raw = raw.replace(/[^\d/]/g, '');

    // Allow user to delete characters
    if (raw.length > 10) {
      raw = raw.slice(0, 10);
    }

    // Auto-insert slash after 2 digits and 4 digits if typed without slashes
    if (/^\d{2}$/.test(raw) && displayValue.length < raw.length) {
      raw = raw + '/';
    } else if (/^\d{2}\/\d{2}$/.test(raw) && displayValue.length < raw.length) {
      raw = raw + '/';
    }

    setDisplayValue(raw);

    // If complete date is typed (10 chars e.g. "08/10/2026")
    if (raw.length === 10) {
      if (isValidDisplayDate(raw)) {
        const iso = displayToIsoDate(raw);
        setIsInvalid(false);
        setErrorMessage('');
        onChange(iso);
      } else {
        setIsInvalid(true);
        setErrorMessage('Invalid date (e.g. 08/10/2026)');
      }
    } else {
      setIsInvalid(false);
      setErrorMessage('');
    }
  };

  // On blur, validate or revert to valid state if corrupted
  const handleInputBlur = () => {
    if (!displayValue.trim()) {
      if (required) {
        setIsInvalid(true);
        setErrorMessage('Date is required');
      } else {
        setIsInvalid(false);
        setErrorMessage('');
        onChange('');
      }
      return;
    }

    // If valid format was typed
    if (isValidDisplayDate(displayValue)) {
      const iso = displayToIsoDate(displayValue);
      setDisplayValue(formatDate(iso));
      setIsInvalid(false);
      setErrorMessage('');
      onChange(iso);
    } else {
      // Revert to original valid value or mark error
      setIsInvalid(true);
      setErrorMessage('Please use valid DD/MM/YYYY');
      // If we already had a valid value, revert gently on blur
      if (value) {
        setDisplayValue(formatDate(value));
        setIsInvalid(false);
        setErrorMessage('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Calendar Day Selection
  const handleSelectDay = (day: number) => {
    const yStr = String(navYear);
    const mStr = String(navMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const iso = `${yStr}-${mStr}-${dStr}`;

    setDisplayValue(`${dStr}/${mStr}/${yStr}`);
    setIsInvalid(false);
    setErrorMessage('');
    setIsOpen(false);
    onChange(iso);
  };

  // Calendar navigation
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((y) => y - 1);
    } else {
      setNavMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear((y) => y + 1);
    } else {
      setNavMonth((m) => m + 1);
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const yStr = String(y);
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const iso = `${yStr}-${mStr}-${dStr}`;

    setNavYear(y);
    setNavMonth(m);
    setDisplayValue(`${dStr}/${mStr}/${yStr}`);
    setIsInvalid(false);
    setErrorMessage('');
    setIsOpen(false);
    onChange(iso);
  };

  // Handle native date picker selection if native picker is used
  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedIso = e.target.value;
    if (pickedIso) {
      const formatted = formatDate(pickedIso);
      setDisplayValue(formatted);
      setIsInvalid(false);
      setErrorMessage('');
      onChange(pickedIso);
      setIsOpen(false);
    }
  };

  // Open native picker if supported, or popover
  const handleTogglePicker = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  // Calendar Grid computation
  const daysInCurrentMonth = getDaysInMonth(navMonth + 1, navYear);
  // Get weekday of 1st day of month: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const firstDayWeekday = new Date(navYear, navMonth, 1).getDay();

  // Currently selected date parts
  let selectedDay: number | null = null;
  let selectedMonth: number | null = null;
  let selectedYear: number | null = null;
  if (value && value.includes('-')) {
    const p = value.split('-');
    selectedYear = parseInt(p[0], 10);
    selectedMonth = parseInt(p[1], 10) - 1;
    selectedDay = parseInt(p[2], 10);
  }

  // Today parts
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Hidden native date input for maximum browser accessibility */}
      <input
        ref={nativeDateRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value || ''}
        min={minDate}
        max={maxDate}
        onChange={handleNativePickerChange}
        className="sr-only pointer-events-none"
      />

      {/* Main Visible DD/MM/YYYY Input Field */}
      <div
        className={`flex items-center w-full border rounded transition-all bg-white ${
          isInvalid
            ? 'border-red-400 ring-1 ring-red-400'
            : 'border-slate-300 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600'
        } ${disabled ? 'bg-slate-100 opacity-70 cursor-not-allowed' : ''} ${className}`}
      >
        <input
          ref={textInputRef}
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          maxLength={10}
          className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono font-medium text-slate-800 bg-transparent focus:outline-hidden"
          title="Format: DD/MM/YYYY (e.g. 08/10/2026)"
        />

        {/* Calendar Trigger Button */}
        <button
          type="button"
          onClick={handleTogglePicker}
          disabled={disabled}
          tabIndex={-1}
          className="px-2 py-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50/80 rounded-r transition-colors cursor-pointer flex items-center justify-center"
          title="Open Calendar Picker"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Error indicator */}
      {isInvalid && errorMessage && (
        <div className="absolute left-0 -bottom-5 flex items-center gap-1 text-[11px] text-red-600 font-medium">
          <AlertCircle className="w-3 h-3" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive ACCOUNTIX Blue Theme Calendar Popover */}
      {isOpen && !disabled && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white border border-blue-200 rounded-lg shadow-xl p-3 text-xs select-none animation-fadeIn">
          {/* Header: Month & Year Navigator */}
          <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
              <span>{MONTH_NAMES_FULL[navMonth]}</span>
              <span className="font-mono text-blue-900">{navYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers: Su Mo Tu We Th Fr Sa */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-slate-500 mb-1">
            <span className="text-red-500">Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span className="text-blue-600">Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
            {/* Empty slots for leading weekday padding */}
            {Array.from({ length: firstDayWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                selectedDay === day &&
                selectedMonth === navMonth &&
                selectedYear === navYear;

              const isToday =
                todayDay === day &&
                todayMonth === navMonth &&
                todayYear === navYear;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-sm flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white font-bold shadow-xs'
                      : isToday
                      ? 'border border-blue-600 text-blue-700 font-bold bg-blue-50/50 hover:bg-blue-100'
                      : 'text-slate-800 hover:bg-blue-50 hover:text-blue-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Popover Footer: Today button & Format reminder */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">Format: DD/MM/YYYY</span>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-700 hover:text-blue-900 font-semibold hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
