import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { world } from '../../../models/paperTrailTypes';

@Component({
  selector: 'app-universe-page',
  templateUrl: './universe-page.component.html',
  styleUrl: './universe-page.component.scss'
})
export class UniversePageComponent {
  universeId: string | null = null;
  universeData: world;
  universeDescription: string = '';
  recommendedBooks: any[] = [];

  constructor(
    private store: StoreService,
    private route: ActivatedRoute
  ) {
    this.universeId = this.route.snapshot.paramMap.get('id');
    if (this.universeId) {
      this.store.getUniverseById(this.universeId).subscribe((res) => {
        this.universeData = res
        this.universeDescription = res.description;
        // this.recommendedBooks = res.recommendedBooks;
      });
    }
  }


  buyUniverse() {
  alert(`🛒 Comprando o universo "${this.universeData?.name}" com ${this.universeData.papers.length} livros!`);
  // Aqui você pode integrar lógica de checkout futuramente
}


}
