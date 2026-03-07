import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService, Toast } from '../../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  toast = inject(ToastService);

  icon(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      error:   'error',
      success: 'check_circle',
      warning: 'warning',
      info:    'info',
    };
    return map[type];
  }

  trackById(_: number, t: Toast): string { return t.id; }
}
