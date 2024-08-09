import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  signUpForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, this.nameValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  nameValidator(control: FormGroup): { [key: string]: boolean } | null {
    const name = control.value;
    const hasInvalidChars = /[^a-zA-Z\s]/.test(name);
    return hasInvalidChars ? { 'nameInvalid': true } : null;
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.auth.signUp(this.signUpForm.value);
    }
  }
}
