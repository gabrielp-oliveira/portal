import { Component } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './features/read-world/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portal';
  showHeaderFooter = true;
  isNavigating = false;

  constructor(private router: Router, readonly theme: ThemeService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      } else if (event instanceof NavigationEnd) {
        this.isNavigating = false;
        const url = event.urlAfterRedirects || event.url;
        this.showHeaderFooter = !url.startsWith('/login')
          && !url.startsWith('/signup')
          && !url.startsWith('/read');
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigating = false;
      }
    });
  }
}
