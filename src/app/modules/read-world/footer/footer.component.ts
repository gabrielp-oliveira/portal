import { Component, OnDestroy } from '@angular/core';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
    imports: [CommonModule, RouterModule], // ✅ importa CommonModule e RouterModule
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'] // corrigido para `styleUrls`
})
export class FooterComponent implements OnDestroy {
  isDarkMode = true;
  private themeSub!: Subscription;

  constructor(public wd: WorldDataService) {
    this.themeSub = this.wd.settings$.subscribe(settings => {
      this.isDarkMode = settings.theme; // true = dark mode
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }
}
