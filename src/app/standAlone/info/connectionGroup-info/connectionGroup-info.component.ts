import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-connectionGroup-info',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './connectionGroup-info.component.html',
  styleUrl: '../info.component.scss'
})
export class ConnectionGroupInfoComponent {

}
