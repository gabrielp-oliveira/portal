import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-timeline-info',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './timeline-info.component.html',
  styleUrl: '../info.component.scss'
})
export class TimelineInfoComponent {

}
