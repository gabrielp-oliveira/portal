import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, Event } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-createEventsDialog',
  templateUrl: './createEventsDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createEventsDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  description: description;
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<createEventsDialogComponent>,
    private wd: WorldDataService,
    private errorHandler: ErrorService,
    @Inject(MAT_DIALOG_DATA) private data: string
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
    this.description = { id: '', resource_type: 'events', resource_id: '' };
    this.worldForm.value.range = 20;
    this.worldForm.value.startRange = 0;
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
    const body: Event = this.worldForm.value;
    body.world_id = this.data;
    body.range = 20;
    body.startRange = 0;
    body.description = this.description?.description_data ?? '';
    this.api.createEvent(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.wd.setLoading(false);
          this.wd.addEvent(data);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
