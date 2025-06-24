import { Component } from '@angular/core';

import { StoreService } from '../store.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paper-page',
  templateUrl: './paper-page.component.html',
  styleUrl: './paper-page.component.scss',
})
export class PaperPageComponent {
paper$ = this.store.storePaper$;
PaperCount:number
worldDescription:string
recommendedBooks: any;

  constructor(
    private store: StoreService,
    private route: ActivatedRoute
  ) {
    const paperId = this.route.snapshot.paramMap.get('paperId');
    if (paperId) {
      this.store.getPaperById(paperId).subscribe((paper) => {
        this.store.setStorePaper(paper.paper);
        console.log(paper.PaperCount)
        this.PaperCount = paper.PaperCount
        this.worldDescription = paper.worldDescription
      });
    }
  }
}
