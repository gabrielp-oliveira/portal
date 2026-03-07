import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Chapter, description, paper } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../utils.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-updatePaperDialog',
  templateUrl: './updatePaperDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class UpdatePaperDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  worldId: string | undefined = '';
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description;

  papers$ = this.wd.papers$;
  chapters$ = this.wd.chapters$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private dialogRef: MatDialogRef<UpdatePaperDialogComponent>,
    private utils: UtilsService,
    private errorHandler: ErrorService,
    @Inject(MAT_DIALOG_DATA) public data: { paperId: string }
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      order: ['', [Validators.required, Validators.min(1)]],
      color: [''],
    });
    this.worldForm.setValue({ name: '', color: '', order: 1, description: '' });
    this.api.getPaperData(this.data.paperId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (paper) => {
          this.wd.setLoading(false);
          this.worldId = paper.world_id;
          this.worldForm.patchValue({
            name: paper.name,
            description: paper.description,
            order: paper.order,
            color: paper.color,
          });
        },
        error: (e) => this.errorHandler.errHandler(e)
      });
  }

  chapterBackgroundColor() {
    return { 'background-color': this.worldForm.value.color || this.utils.numberToHex(this.data.paperId) };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body = this.worldForm.value;
    body.world_id = this.worldId;
    body.id = this.data.paperId;
    body.color = this.worldForm.value.color;
    this.api.updatePaper(this.data.paperId, this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.wd.setLoading(false);
          this.wd.updatePaper(data);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }

  addNewChapter(newChapter: Chapter) {
    this.wd.addChapter(newChapter);
  }
}
