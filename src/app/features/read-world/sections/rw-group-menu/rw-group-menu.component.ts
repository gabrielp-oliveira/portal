import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chapter, paper } from '../../../../models/paperTrailTypes';
import { CloudinaryPipe } from '../../../dashboard/pipes/cloudinary.pipe';

export interface GroupMenuItem { chapter: Chapter; paper: paper; }
export interface GroupMenuPosition { x: number; y: number; }

@Component({
  standalone: true,
  selector: 'app-rw-group-menu',
  templateUrl: './rw-group-menu.component.html',
  styleUrls: ['./rw-group-menu.component.scss'],
  imports: [CommonModule, MatIconModule, MatTooltipModule, CloudinaryPipe],
})
export class RwGroupMenuComponent {
  @Input() position: GroupMenuPosition = { x: 0, y: 0 };
  @Input() items: GroupMenuItem[] = [];

  @Output() close        = new EventEmitter<void>();
  @Output() navigate     = new EventEmitter<{ paperId: string; order: number }>();
  @Output() openDetails  = new EventEmitter<string>();

  trackByChapterId(_: number, item: GroupMenuItem): string { return item.chapter.id; }
}
