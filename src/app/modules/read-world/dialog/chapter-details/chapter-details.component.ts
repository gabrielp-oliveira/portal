import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorldDataService } from '../../../dashboard/world-data.service';
import { Chapter, paper, StoryLine, Timeline } from '../../../../models/paperTrailTypes';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.component.html',
  styleUrl: './chapter-details.component.scss'
})
export class ChapterDetailsComponent {
  isDarkMode:boolean = false

  chapter: Chapter
  paper: paper
  link: string

  timeline: Timeline
  storyline: StoryLine

  constructor(
    public dialogRef: MatDialogRef<ChapterDetailsComponent>,
    private wd:WorldDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.chapter = data.chapter
    this.paper = data.paper
    this.link = data.link
    this.wd.settings$.subscribe((ss) => {
      this.isDarkMode = ss.theme
    })
    this.wd.timelines$.subscribe((tl) => {
      this.timeline = tl.filter((t) => t.id == this.chapter.timeline_id)[0]
    })
    this.wd.storylines$.subscribe((st) => {
      this.storyline = st.filter((s) => s.id == this.chapter.storyline_id)[0]
    })
  }
  tabs = ['resumo', 'timeline', 'notes', 'storyline'];

  close() {
    this.dialogRef.close();
  }

    selectedTab: string = 'resumo';



}
