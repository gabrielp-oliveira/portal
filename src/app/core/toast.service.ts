import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  show(type: ToastType, message: string, duration = 4500): void {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, message, duration };
    this._toasts$.next([...this._toasts$.value, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }

  error(message: string, duration?: number)   { this.show('error',   message, duration); }
  success(message: string, duration?: number) { this.show('success', message, duration); }
  warning(message: string, duration?: number) { this.show('warning', message, duration); }
  info(message: string, duration?: number)    { this.show('info',    message, duration); }
}
