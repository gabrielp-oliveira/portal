import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private auth  = inject(AuthService);
  private title = inject(Title);
  private meta  = inject(Meta);

  isUserLogged = false;

  private readonly isLogged$ = this.auth.isLogged$.pipe(takeUntilDestroyed());

  ngOnInit(): void {
    this.isLogged$.subscribe(status => { this.isUserLogged = status; });

    this.title.setTitle('Portal — Leia e explore universos literários');
    this.meta.updateTag({ name: 'description', content: 'Descubra livros, explore universos e acompanhe sua jornada de leitura no Portal.' });
    this.meta.updateTag({ name: 'robots',      content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title',       content: 'Portal' });
    this.meta.updateTag({ property: 'og:description', content: 'Descubra livros, explore universos e acompanhe sua jornada de leitura no Portal.' });
    this.meta.updateTag({ property: 'og:type',        content: 'website' });
  }
}
