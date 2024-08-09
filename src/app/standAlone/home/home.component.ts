import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  isUserLogged:boolean = false
  constructor(private auth: AuthService){}
  ngOnInit(){
   this.isUserLogged= this.auth.isUserLogged() 
   console.log(this.isUserLogged)
  }
}
