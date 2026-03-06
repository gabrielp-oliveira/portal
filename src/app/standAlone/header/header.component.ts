import { Component, Input, OnInit, inject } from '@angular/core';
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
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class HeaderComponent implements OnInit {
  @Input() default: boolean = false;

  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private wd = inject(WorldDataService);
  private auth = inject(AuthService);
  private router = inject(Router);

  settings$?: Observable<Subway_Settings>;
  isLogged = false;

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
