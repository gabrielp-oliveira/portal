import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Reusable collapsible panel wrapper.
 * Usage:
 *   <app-panel-shell headerId="hdr-foo" title="Foo" icon="icon_name"
 *                    [collapsed]="..." (toggle)="...">
 *     content
 *   </app-panel-shell>
 */
@Component({
  standalone: false,
  selector: 'app-panel-shell',
  templateUrl: './panel-shell.component.html',
  styleUrl: './panel-shell.component.scss',
})
export class PanelShellComponent {
  @Input() headerId = '';
  @Input() title = '';
  @Input() icon = '';
  @Input() iconClass = '';
  @Input() collapsed = false;
  @Input() count: number | null = null;
  @Output() toggle = new EventEmitter<void>();
}
