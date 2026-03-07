import { Pipe, PipeTransform } from '@angular/core';

/** Pure pipe — Angular caches the result for identical inputs, avoiding
 *  redundant recalculations on every change-detection cycle. */
@Pipe({ name: 'progress', standalone: false, pure: true })
export class ProgressPipe implements PipeTransform {
  transform(completed: number, total: number): number {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }
}
