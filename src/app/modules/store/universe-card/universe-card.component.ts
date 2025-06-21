import { Component, Input } from '@angular/core';
import { world } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-universe-card',
  templateUrl: './universe-card.component.html',
  styleUrls: ['./universe-card.component.scss']
})
export class UniverseCardComponent {

  @Input() paperCount!: number;
  @Input() world: world;

  defaultCover = 'assets/defaultCover.png';
  DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  optimizeImage(url: string): string {
    if (!url) return this.defaultCover;
    return url.includes('/upload/')
      ? url.replace('/upload/', '/upload/w_300,f_auto,q_auto/')
      : url;
  }
}
