import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, Timeline } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-updateTimelineDialog',
  templateUrl: './updateTimelineDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class UpdateTimelineDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description;
  range: number = 1;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private dialogRef: MatDialogRef<UpdateTimelineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Timeline,
    private errorHandler: ErrorService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      range: [0],
    });

    const d = { id: '', resource_type: 'timeline', resource_id: data.id };
    this.wd.setLoading(false);
    this.api.getDescription(d)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (desc) => {
          this.wd.setLoading(false);
          this.description = desc;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });

    this.worldForm.patchValue({ name: data.name, description: data.description, range: data?.range });
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body = { ...this.data, ...this.worldForm.value };
    body.description = this.description.description_data;
    this.api.updateTimeline(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tl) => {
          this.wd.setLoading(false);
          this.dialogRef.close();
          this.wd.updateTimeline(tl);
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }

  formatLabel(value: number): string {
    this.range = value;
    return `${value}`;
  }
}
