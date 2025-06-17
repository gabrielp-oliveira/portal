import { Component } from '@angular/core';
import { StoreService } from '../../store.service';
import { paper } from '../../../../models/paperTrailTypes';

@Component({
  selector: 'app-store-body',
  templateUrl: './body-store.component.html',
  styleUrl: './body-store.component.scss'
})
export class BodyStoreComponent {
  papers: paper[]
  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
     this.storeService.papersSubject$.subscribe((pp) => {
      if(pp){
        
        this.papers = pp
      }

    })

  }
}
