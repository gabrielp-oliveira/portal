import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Chapter, ChapterAnnotation } from '../../../../models/paperTrailTypes';
import { CloudinaryPipe } from '../../../dashboard/pipes/cloudinary.pipe';

export interface ChapterMenuPosition { x: number; y: number; }

@Component({
  standalone: true,
  selector: 'app-rw-chapter-menu',
  templateUrl: './rw-chapter-menu.component.html',
  styleUrls: ['./rw-chapter-menu.component.scss'],
  imports: [CommonModule, MatIconModule, CloudinaryPipe],
})
export class RwChapterMenuComponent {
  @Input() position: ChapterMenuPosition = { x: 0, y: 0 };
  @Input() chapter: Chapter | null = null;
  @Input() paperName: string | null = null;
  @Input() paperCoverUrl: string | null = null;
  @Input() paperColor: string | null = null;
  @Input() expanded = false;
  @Input() timelineName: string | null = null;
  @Input() storylineName: string | null = null;

  @Output() close           = new EventEmitter<void>();
  @Output() navigate        = new EventEmitter<{ paperId: string; order: number }>();
  @Output() openDetails     = new EventEmitter<string>();
  @Output() toggleExpanded  = new EventEmitter<void>();

  sortedAnnotations(): ChapterAnnotation[] {
    if (!this.chapter?.annotations?.length) return [];
    return [...this.chapter.annotations].sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }

  favAnnotationsCount(): number {
    return this.chapter?.annotations?.filter(a => a.favorite).length ?? 0;
  }

  trackById(_: number, item: { id?: string }): string | number { return item.id ?? _; }
}
