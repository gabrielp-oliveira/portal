import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);

  isUserLogged = false;

  private readonly isLogged$ = this.auth.isLogged$.pipe(takeUntilDestroyed());

  ngOnInit(): void {
    this.isLogged$.subscribe(status => {
      this.isUserLogged = status;
    });
  }
}
