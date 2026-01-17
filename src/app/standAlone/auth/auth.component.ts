import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  signUpForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(5)]),
  });

  constructor(private authService: AuthService) {}

  googleLogin() {
    this.authService.googleLogin()
      .pipe(takeUntil(this.destroy$))
      .subscribe((a) => {
          window.location.href = a
      });
  }

  microsoftLogin() {
    this.authService.microsoftLogin()
      .pipe(takeUntil(this.destroy$))
      .subscribe((a) => {
          window.location.href = a
      });
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.authService.login(this.signUpForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Login realizado com sucesso.');
          },
          error: err => {
            console.error('Erro no login:', err);
          }
        });
    } else {
      console.warn('Formulário inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
