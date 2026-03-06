import { Component, inject } from '@angular/core';
import { WorldDataService } from '../../dashboard/world-data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  readonly wd = inject(WorldDataService);
  isDarkMode = true;

  constructor() {
    this.wd.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.isDarkMode = settings.theme;
      });
  }
}
