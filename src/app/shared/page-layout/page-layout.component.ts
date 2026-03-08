import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pg__head"><ng-content select="[pageHead]"></ng-content></div>
    <div class="pg__main"><ng-content select="[pageMain]"></ng-content></div>
    <div class="pg__sidebar" *ngIf="!noSidebar"><ng-content select="[pageSidebar]"></ng-content></div>
  `,
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {
  @Input() noSidebar = false;
}
