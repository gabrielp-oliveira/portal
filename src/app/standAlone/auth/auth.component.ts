import { Component, DestroyRef, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  signUpForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(5)]),
  });

  googleLogin() {
    this.authService.googleLogin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((a) => {
          window.location.href = a
      });
  }

  microsoftLogin() {
    this.authService.microsoftLogin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((a) => {
          window.location.href = a
      });
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.authService.login(this.signUpForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
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
}
