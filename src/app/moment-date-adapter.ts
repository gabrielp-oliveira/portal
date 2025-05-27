import { DateAdapter } from '@angular/material/core';
import moment from 'moment';

export class MomentDateAdapter extends DateAdapter<moment.Moment> {
  override getDayOfWeek(date: moment.Moment): number {
      throw new Error('Method not implemented.');
  }
  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
      throw new Error('Method not implemented.');
  }
  override getDateNames(): string[] {
      throw new Error('Method not implemented.');
  }
  override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
      throw new Error('Method not implemented.');
  }
  override getYearName(date: moment.Moment): string {
      throw new Error('Method not implemented.');
  }
  override getFirstDayOfWeek(): number {
      throw new Error('Method not implemented.');
  }
  override getNumDaysInMonth(date: moment.Moment): number {
      throw new Error('Method not implemented.');
  }
  override clone(date: moment.Moment): moment.Moment {
      throw new Error('Method not implemented.');
  }
  override today(): moment.Moment {
      throw new Error('Method not implemented.');
  }
  override addCalendarYears(date: moment.Moment, years: number): moment.Moment {
      throw new Error('Method not implemented.');
  }
  override addCalendarMonths(date: moment.Moment, months: number): moment.Moment {
      throw new Error('Method not implemented.');
  }
  override addCalendarDays(date: moment.Moment, days: number): moment.Moment {
      throw new Error('Method not implemented.');
  }
  override isDateInstance(obj: any): boolean {
      throw new Error('Method not implemented.');
  }
  override invalid(): moment.Moment {
      throw new Error('Method not implemented.');
  }
  override parse(value: any): moment.Moment | null {
    if (!value) {
      return null;
    }
    return moment(value, 'MM/DD/YYYY');
  }

  override format(date: moment.Moment, displayFormat: string): string {
    return date.format(displayFormat);
  }

  override toIso8601(date: moment.Moment): string {
    return date.toISOString();
  }

  override isValid(date: moment.Moment): boolean {
    return date.isValid();
  }

  override getYear(date: moment.Moment): number {
    return date.year();
  }

  override getMonth(date: moment.Moment): number {
    return date.month();
  }

  override getDate(date: moment.Moment): number {
    return date.date();
  }

  override createDate(year: number, month: number, date: number): moment.Moment {
    return moment({ year, month, date });
  }
}
