import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Chapter, infoDialog, Timeline } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';

@Component({
  standalone: false,
  selector: 'app-deleteTimelineDialog',
  templateUrl: './deleteTimelineDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class deleteTimelineDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  range: number = 1;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<deleteTimelineDialogComponent>,
    private errorHandler: ErrorService,
    private dialog: DialogService,
    private wd: WorldDataService,
    @Inject(MAT_DIALOG_DATA) public data: { timeline: Timeline; timelines: Timeline[]; chapters: Chapter[] }
  ) {
    this.worldForm = this.fb.group({ confirm: [false, [Validators.required]] });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    if (this.worldForm.value.confirm) {
      if (this.data.timelines.length > 1) {
        this.api.deleteTimeline(this.data.timeline.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (results) => {
              this.wd.setLoading(false);
              const chaptersToUpdate = this.data.chapters.filter((c) => c.timeline_id == this.data.timeline.id);
              const nextTimeline = this.data.timelines.filter((t) => t.order == this.data.timeline.order + 1)[0];
              const prevTimeline = this.data.timelines.filter((t) => t.order == this.data.timeline.order - 1)[0];
              const newTimeline = nextTimeline || prevTimeline;

              chaptersToUpdate.map((e) => {
                if (!newTimeline) {
                  e.storyline_id = '';
                  e.timeline_id = '';
                  return this.api.updateChapter(e.id, e)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: (c) => { this.wd.setLoading(false); this.wd.updateChapter(c); },
                      error: (e) => this.errorHandler.errHandler(e)
                    });
                } else {
                  e.timeline_id = newTimeline.id;
                  return this.api.updateChapter(e.id, e)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: (c) => { this.wd.setLoading(false); this.wd.updateChapter(c); },
                      error: (e) => this.errorHandler.errHandler(e)
                    });
                }
              });

              this.wd.removeTimeline(results.id);
              this.data.timelines.map((tl) => {
                if (tl.order > this.data.timeline.order) {
                  tl.order -= 1;
                  return this.api.updateTimeline(tl)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: (tl) => { this.wd.setLoading(false); this.wd.updateTimeline(tl); },
                      error: (e) => this.errorHandler.errHandler(e)
                    });
                }
                return undefined;
              });
            },
            error: (err) => this.errorHandler.errHandler(err)
          });
      } else {
        const info: infoDialog = {
          status: 'warning',
          action: 'Delete Timeline',
          message: 'you must have at least one timeline',
          header: 'fail to delete timeline'
        };
        this.dialog.openInfoDialog(info);
      }
    }
  }

  formatLabel(value: number): string {
    this.range = value;
    return `${value}`;
  }
}
