import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-chapter-info',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './chapter-info.component.html',
  styleUrl: '../info.component.scss'
})
export class ChapterInfoComponent {

}
