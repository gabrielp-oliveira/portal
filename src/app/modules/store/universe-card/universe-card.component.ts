import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { world } from '../../../models/paperTrailTypes';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-universe-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './universe-card.component.html',
  styleUrls: ['./universe-card.component.scss']
})
export class UniverseCardComponent {
  @Input() world: world;
  @Input() library: boolean = false;

  constructor(private router: Router) {}

  defaultCover = 'assets/defaultCover.png';
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  optimizeImage(url: string): string {
    if (!url) return this.defaultCover;
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/w_300,f_auto,q_auto/')
      : url;
  }

  goToStoreUniverse() {
    this.router.navigate(['/store/universe', this.world.id]);
  }
}
