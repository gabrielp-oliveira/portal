import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorldDataService } from '../../../dashboard/world-data.service';
import {
  Chapter,
  chapterDetailsModal,
  paper,
  StoryLine,
  Timeline
} from '../../../../models/paperTrailTypes';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.component.html',
  styleUrls: ['./chapter-details.component.scss']
})
export class ChapterDetailsComponent {
  isDarkMode: boolean = false;

  chapter!: Chapter;
  paper!: paper;
  link: string = '';

  timeline!: Timeline;
  storyline!: StoryLine;

  tabs = ['resumo', 'timeline', 'notes', 'storyline'];
  selectedTab: string = 'resumo';

  constructor(
    public dialogRef: MatDialogRef<ChapterDetailsComponent>,
    private wd: WorldDataService,
    private api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: chapterDetailsModal | string
  ) {
    this.wd.settings$.subscribe((ss) => (this.isDarkMode = ss.theme));

    if (typeof data === 'string') {
      // Carregar detalhes via API se for apenas o ID do capítulo
      this.api.getchapterDetails(data).subscribe((details) => {
        const ch = details.chapters;

        this.chapter = {
          id: ch.ID,
          title: ch.Title,
          description: ch.Description,
          created_at: ch.CreatedAt,
          paper_id: ch.PaperID,
          world_id: ch.WorldID,
          event_Id: ch.EventID || '',
          order: ch.Order,
          range: ch.Range || 0,
          pageCount: ch.PageCount || 0,
          timeline_id: ch.TimelineID,
          storyline_id: ch.StorylineID,
          color: '', // ou alguma lógica para definir cor
          selected: false,
          focus: false,
          favorite: ch.Favorite,
          completed: ch.Completed,
          annotations: [],
          width: 0,
          height: 0
        };

        this.paper = {
          id: ch.PaperID,
          name: ch.PaperName,
          description: '',
          path: '',
          created_at: '',
          AlreadyPurchased: false,
          publisher: '',
          world_id: ch.WorldID,
          world_name: '',
          status: 'available',
          price: 0,
          priceCurrency: '',
          priceCountry: '',
          order: 0,
          color: '',
          author_id: '',
          author_name: '',
          author: '',
          language: '',
          year: 0,
          cover_url: '',
          genre: [],
          maturity: '',
          isbn_10: '',
          isbn_13: '',
          categories: [],
          total_pages: 0
        };

        this.timeline = {
          id: ch.TimelineID,
          name: ch.TimelineName,
          description: ch.TimelineDesc,
          order: 0,
          range: 0,
          created_at: '',
          world_id: ch.WorldID,
          visible: true
        };

        this.storyline = {
          id: ch.StorylineID,
          name: ch.StorylineName,
          description: ch.StorylineDesc,
          Created_at: '',
          order: 0,
          world_id: ch.WorldID
        };
      });

    } else {
      // Dados já vieram completos do componente pai
      this.chapter = data.chapter;
      this.paper = data.paper;
      this.link = data.link;

      this.wd.timelines$.subscribe((tl) => {
        this.timeline = tl.find((t) => t.id === this.chapter.timeline_id)!;
      });

      this.wd.storylines$.subscribe((st) => {
        this.storyline = st.find((s) => s.id === this.chapter.storyline_id)!;
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
