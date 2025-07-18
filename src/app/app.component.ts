import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './standAlone/header/header.component';
import { FooterComponent } from './modules/read-world/footer/footer.component';
import { CommonModule } from '@angular/common'; // ✅ AQUI
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent], // ✅ AQUI
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portal';
  showHeaderFooter = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.showHeaderFooter = !url.startsWith('/login')
         && !url.startsWith('/signup')
         && !url.startsWith('/read')
      });
  }
}
