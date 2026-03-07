import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../../core/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private theme = inject(ThemeService);
  isDarkMode = this.theme.isDark;

  constructor() {
    this.theme.isDark$
      .pipe(takeUntilDestroyed())
      .subscribe(dark => { this.isDarkMode = dark; });
  }
}
