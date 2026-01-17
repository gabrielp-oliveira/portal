import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Subway_Settings } from '../../models/paperTrailTypes';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../modules/api.service';
import { WorldDataService } from '../../modules/dashboard/world-data.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() default: boolean = false;

  settings$?: Observable<Subway_Settings>;
  isLogged: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.default) {
      this.settings$ = this.wd.settings$;
    }

    this.auth.isLogged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(logged => {
        this.isLogged = logged;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  GoTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateIfLogged(path: string): void {
    if (this.isLogged) {
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleTheme(settings: Subway_Settings): void {
    const updatedSettings = { ...settings, theme: !settings.theme };
    this.api.updateSettings(settings.id, updatedSettings).subscribe(() => {
      this.wd.setSettings(updatedSettings);
    });
  }

  shareStore(): void {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'Minha Loja de Livros',
        url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('📋 Link da loja copiado!');
      });
    }
  }

  logout(): void {
    this.auth.logOut();
    this.router.navigate(['/']);
  }
}
