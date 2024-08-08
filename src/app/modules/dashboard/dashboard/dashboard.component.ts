import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {

  constructor(private api:ApiService, private auth:AuthService){}
  ngOnInit(){
    this.api.GetRootList()
    console.log(this.auth.logged)
  }

  logOut(){
    this.auth.logOut()
  }
}
