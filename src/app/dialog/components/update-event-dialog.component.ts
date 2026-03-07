import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Event } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-updateEventDialog',
  templateUrl: './updateEventDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class UpdateEventDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<UpdateEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event,
    private errorHandler: ErrorService,
    private wd: WorldDataService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
    });
    this.worldForm.patchValue({ name: data.name, description: data.description });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    const event: Event = this.data;
    event.name = this.worldForm.value.name;
    event.description = this.worldForm.value.description;
    this.api.updateEvent(event)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.wd.setLoading(false);
          this.wd.updateEvent(data);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
