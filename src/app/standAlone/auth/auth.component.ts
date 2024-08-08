import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Validators } from "@angular/forms";
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {


  constructor(private authService: AuthService) {}

  googleLogin() {
    this.authService.googleLogin();
  }
  microsoftLogin() {
    this.authService.microsoftLogin();
  }

  signUpForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.minLength(5)]),
    password: new FormControl("", [Validators.required, Validators.minLength(5)]),
  });

  updateProfile() {

  }

  onSubmit() {
    console.log(this.signUpForm.value);
  }
  
}
