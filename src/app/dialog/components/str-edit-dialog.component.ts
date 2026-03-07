import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, StoryLine } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-strEdit',
  templateUrl: './strEditDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class strEditDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<strEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StoryLine,
    private errorHandler: ErrorService,
    private wd: WorldDataService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
    });

    const d = { id: '', resource_type: 'chapter', resource_id: data.id };
    this.api.getDescription(d)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (desc) => {
          this.wd.setLoading(false);
          this.description = desc;
        },
        error: (err) => this.errorHandler.errHandler(err)
      });

    this.worldForm.patchValue({ name: data.name, description: data.description });
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
    body.world_id = this.wd.worldId;
    body.description = this.description.description_data;
    this.api.updateStoryLine(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (str) => {
          this.wd.setLoading(false);
          this.wd.updateStoryline(str);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
