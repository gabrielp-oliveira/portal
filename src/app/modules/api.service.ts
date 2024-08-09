import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { world } from '../models/papperTrailTypes';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private router: Router) {}



  GetRootList() :Observable<world[]>{
    return this.http.get<world[]>('http://localhost:9090/getWorldsList')
  }
  Createworld(body: any):Observable<world>  {
   return this.http.post<world>('http://localhost:9090/createWorld', body)
  }


}
