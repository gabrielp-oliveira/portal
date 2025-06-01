import { Component, Input } from '@angular/core';
import { UtilsService } from '../../../utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private Util: UtilsService, private route: ActivatedRoute,) { }
  @Input() worldName: string = 'O Mundo das Irmãs March';



  ngOnInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    const displayName = worldName?.replace(/_/g, ' ');
    this.worldName = displayName || ""

  }
  toggleTheme() {
    this.Util.toggleThme()
  }
}
