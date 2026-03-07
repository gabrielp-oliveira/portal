import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Chapter, paper, Timeline } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../utils.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-updateChapterDialog',
  templateUrl: './updateChapterDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class UpdateChapterDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  tl: Timeline[];
  selectedTl: Timeline = {
    range: 0, id: '', world_id: '', name: '', description: '',
    order: 1, created_at: '', visible: true
  };
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  range: number = 1;

  papers$ = this.wd.papers$;
  timelines$ = this.wd.timelines$;
  storylines$ = this.wd.storylines$;
  chapters$ = this.wd.chapters$;
  world$ = this.wd.world$;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateChapterDialogComponent>,
    private api: ApiService,
    private errorHandler: ErrorService,
    private wd: WorldDataService,
    private utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
  ) {
    this.timelines$.pipe(takeUntil(this.destroy$)).subscribe((tl) => this.tl = tl);
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      paper_id: ['', [Validators.required]],
      order: ['', [Validators.required, Validators.min(1)]],
      timeline_id: ['', []],
      storyline_id: [''],
    });
    this.chapters$.pipe(takeUntil(this.destroy$)).subscribe((cpList) => {
      const chapter = cpList.filter((cp) => cp.id == this.data.chapterId)[0];
      const e = { target: { value: chapter.timeline_id } };
      this.getTimeLineDetails(e);
      this.worldId = chapter.world_id;
      this.worldForm.patchValue({
        name: chapter.title,
        order: chapter.order,
        paper_id: chapter.paper_id,
        timeline_id: chapter?.timeline_id,
        storyline_id: chapter?.storyline_id,
        range: chapter?.range,
      });
    });
  }

  chapterBackgroundColor(pp: paper) {
    return { 'background-color': pp.color || this.utils.numberToHex(pp.id) };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body = this.worldForm.value;
    body.world_id = this.worldId;
    body.id = this.data.chapterId;
    this.api.updateChapter(this.data.chapterId, this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dialogRef.close();
          this.wd.setLoading(false);
          this.wd.updateChapter(data);
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }

  formatLabel(value: number): string {
    this.range = value;
    return `${value}`;
  }

  getTimeLineDetails(e: any) {
    const val: string = e.target.value;
    if (val != null && val.trim() != '') {
      const result = this.tl.filter((t) => t.id == val);
      this.selectedTl = result[0];
    }
  }
}
