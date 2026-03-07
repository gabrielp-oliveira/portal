import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, Timeline } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-createTimelineDialog',
  templateUrl: './createTimelineDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createTimelineDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<createTimelineDialogComponent>,
    private wd: WorldDataService,
    private errorHandler: ErrorService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body: Timeline = this.worldForm.value;
    body.range = 20;
    body.world_id = this.wd.worldId;
    this.api.createTimeline(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.wd.addTimeline(data);
          this.wd.setLoading(false);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
