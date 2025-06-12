import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Subway_Settings } from '../../../models/paperTrailTypes';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() worldName: string = 'O Mundo das Irmãs March';
  settings$!: Observable<Subway_Settings>;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService
  ) {}

  ngOnInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    const displayName = worldName?.replace(/_/g, ' ');
    this.worldName = displayName || '';

    this.settings$ = this.wd.settings$;
  }

  toggleTheme(settings: Subway_Settings) {
    const updatedSettings = { ...settings, theme: !settings.theme };
    this.api.updateSettings(settings.id, updatedSettings).subscribe(() => {
      this.wd.setSettings(updatedSettings); // atualiza o estado
    });
  }

  shareWorld() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.worldName,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('📋 Link copiado!');
      });
    }
  }
}
