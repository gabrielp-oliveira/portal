import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = 
  new BehaviorSubject<boolean>(false);
  
  loading$ = this.loadingSubject.asObservable();
  
  loadingOn() {
    if(!this.loadingSubject.value){
      this.loadingSubject.next(true);
    }
  }
  
  loadingOff() {

    if(this.loadingSubject.value){
      this.loadingSubject.next(false);
    }
  }
}
