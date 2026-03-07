import { Pipe, PipeTransform } from '@angular/core';

/** Pure pipe — Angular caches the result for the same ISO string input. */
@Pipe({ name: 'timeAgo', standalone: false, pure: true })
export class TimeAgoPipe implements PipeTransform {
  transform(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  }
}
