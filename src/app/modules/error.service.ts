import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  
  constructor(private auth: AuthService){ }
  errHandler(error: any) {
    console.error(error)
      if (error.status === 401 || error.status === 403) {
        console.error(error)
        this.auth.logOut();
      }
  } 
}
