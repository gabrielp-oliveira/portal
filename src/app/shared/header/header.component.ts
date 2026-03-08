import { Component, HostListener, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subway_Settings } from '../../models/paperTrailTypes';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() default: boolean = false;

  private api = inject(ApiService);
  private wd = inject(WorldDataService);
  private auth = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);

  settings$?: Observable<Subway_Settings>;
  isLogged    = false;
  menuOpen    = false;
  userMenuOpen = false;

  @HostListener('document:click')
  closeUserMenu(): void { this.userMenuOpen = false; }

  toggleUserMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  constructor() {
    this.auth.isLogged$
      .pipe(takeUntilDestroyed())
      .subscribe(logged => {
        this.isLogged = logged;
      });
  }

  ngOnInit(): void {
    if (!this.default) {
      this.settings$ = this.wd.settings$;
    }
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
