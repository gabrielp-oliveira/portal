import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { WorldDataService } from '../../dashboard/world-data.service';
import { Subway_Settings } from '../../../models/paperTrailTypes';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() worldName: string = 'O Mundo das Irmãs March';
  settings$!: Observable<Subway_Settings>;
  isLogged = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName');
    const displayName = worldName?.replace(/_/g, ' ');
    this.worldName = displayName || '';

    this.settings$ = this.wd.settings$;

    this.auth.isLogged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isLogged = status;
      });
  }

  logout() {
    this.auth.logOut();
    this.router.navigate(['/']); // redireciona após logout
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
