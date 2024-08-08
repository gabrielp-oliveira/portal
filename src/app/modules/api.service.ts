import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private router: Router) {}



  GetRootList() {
    this.http.get<{ url: string }>('http://localhost:9090/getRootPapperList').subscribe((data) => {
      console.log(data)
    }) 
  }


}
