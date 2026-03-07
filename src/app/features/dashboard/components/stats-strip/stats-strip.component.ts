import { Component, Input } from '@angular/core';
import { StatCard } from '../../dashboard.data.service';

@Component({
  standalone: false,
  selector: 'app-stats-strip',
  templateUrl: './stats-strip.component.html',
  styleUrl: './stats-strip.component.scss',
})
export class StatsStripComponent {
  @Input() cards: StatCard[] = [];
}
