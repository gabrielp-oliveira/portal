import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WorldHeroResponse, paperCard } from '../../../../models/paperTrailTypes';
import { CloudinaryPipe } from '../../../dashboard/pipes/cloudinary.pipe';

@Component({
  standalone: true,
  selector: 'app-rw-hero',
  templateUrl: './rw-hero.component.html',
  styleUrls: ['./rw-hero.component.scss'],
  imports: [CommonModule, MatIconModule, CloudinaryPipe],
})
export class RwHeroComponent {
  @Input() phaseHeroLoaded = false;
  @Input() heroData: WorldHeroResponse | null = null;
  @Input() paperCardList: paperCard[] = [];
  @Input() readingPct = 0;
  @Input() totalChapters = 0;
  @Input() totalCompletedChapters = 0;
  @Input() totalFavorites = 0;
  @Input() totalAnnotations = 0;
  @Input() completedBooks = 0;
  @Input() backdropCover = '';
  @Input() uniqueAuthors: string[] = [];
}
