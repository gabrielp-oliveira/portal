import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';
import { paper, world } from '../../../models/paperTrailTypes';
import { paperCard } from '../../read-world/paper-card/paper-card.component';
import { WorldDataService } from '../../dashboard/world-data.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  books: paper[] = [];
  totalBooks: number = 0;
  page: number = 1;
  limit: number = 12;

  worlds: world[] = [];

  loadingBooks = false;
  loadingWorlds = false;

  activeTabIndex: number = 0; // ✅ agora declarado
  paperCardList: paperCard[]

  constructor(private libraryService: LibraryService, private wd: WorldDataService) {}

  ngOnInit(): void {
    this.fetchBooks(); // books é a aba padrão
  }

fetchBooks(): void {
  this.loadingBooks = true;

  this.libraryService.getLibraryBooks(this.page, this.limit).subscribe({
    next: (res) => {
      this.books = res.papers;
      this.totalBooks = res.total;

      // montar paperCardList agrupando capítulos por paper
      this.paperCardList = this.books.map((paper) => {
        const chapterList = res.chapters.filter(
          (chapter) => chapter.paper_id === paper.id
        );
        return { paper, chapterList };
      });

      this.loadingBooks = false;
    },
    error: () => {
      this.loadingBooks = false;
    }
  });
}


  fetchWorlds(): void {
    this.loadingWorlds = true;
    this.libraryService.getUserWorlds().subscribe({
      next: (res) => {
        this.worlds = res.map((w) => {
          w.CoverURLs = w.papers.map((p) => p.cover_url)
          w.PaperCount = w.papers.length
          return w
        });

        this.loadingWorlds = false;
      },
      error: () => {
        this.loadingWorlds = false;
      }
    });
  }


  onPageChange(pageIndex: number): void {
    this.page = pageIndex + 1;
    this.fetchBooks();
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;

    if (index === 1 && this.worlds.length === 0) {
      this.fetchWorlds();
    }
  }
    DEFAULT_COVER = 'https://res.cloudinary.com/dyibidxxv/image/upload/w_100,f_auto,q_auto/defaultCover_lublod';

    optimizeImage(url: string, width: number = 100): string {
    return url?.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

}
