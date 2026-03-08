import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { world } from '../../../models/paperTrailTypes';
import { CloudinaryPipe } from '../../dashboard/pipes/cloudinary.pipe';

@Component({
  selector: 'app-universe-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    CloudinaryPipe,
  ],
  templateUrl: './universe-card.component.html',
  styleUrls: ['./universe-card.component.scss']
})
export class UniverseCardComponent {
  @Input() world: world;
  @Input() library: boolean = false;

  readonly DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_300,f_auto,q_auto/defaultCover_lublod';

  private router = inject(Router);

  get coversCount(): number {
    return this.world?.CoverURLs?.length || 0;
  }

  formatPrice(value: number | undefined, currency: string = 'USD'): string {
    if (value == null) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  }

  navigate(): void {
    if (!this.library) {
      this.router.navigate(['/store/universe', this.world.id]);
    }
  }
}
