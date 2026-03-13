import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './features/read-world/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/theme.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'portal';
  showHeaderFooter = true;
  isNavigating = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    readonly theme: ThemeService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      } else if (event instanceof NavigationEnd) {
        this.isNavigating = false;
        const url = event.urlAfterRedirects || event.url;
        this.showHeaderFooter = !url.startsWith('/login')
          && !url.startsWith('/signup')
          && !url.startsWith('/read')
          && !url.startsWith('/onboarding')
          && !url.startsWith('/forgot-password')
          && !url.startsWith('/reset-password');
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigating = false;
      }
    });
  }

  ngOnInit(): void {
    // Intercepta callback OAuth em qualquer rota (backend pode redirecionar para /)
    // Usa URLSearchParams diretamente pois o router ainda não processou a URL no ngOnInit
    const urlParams   = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const expiry      = urlParams.get('expiry');
    const sessionId   = urlParams.get('sessionId');
    const oauthError  = urlParams.get('error');

    if (oauthError) {
      this.router.navigate(['/login'], { queryParams: { error: oauthError } });
      return;
    }

    if (accessToken && expiry) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('expiry', expiry);
      if (sessionId) localStorage.setItem('sessionId', sessionId);
      this.auth.setLoggedStatus(true);

      const authRedirect = localStorage.getItem('auth-redirect');
      localStorage.removeItem('auth-redirect');

      this.auth.getProfileDetails().subscribe({
        next: details => {
          if (!details.onboarding_complete) {
            this.router.navigate(['/onboarding']);
          } else {
            this.router.navigate([authRedirect ?? '/dashboard']);
          }
        },
        error: () => this.router.navigate([authRedirect ?? '/dashboard'])
      });
    }
  }
}
