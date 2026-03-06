import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-event-info',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './event-info.component.html',
  styleUrl: '../info.component.scss'
})
export class EventInfoComponent {

}
