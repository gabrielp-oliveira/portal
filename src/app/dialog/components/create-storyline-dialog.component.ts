import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, StoryLine } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-createStorylineDialog',
  templateUrl: './createStorylineDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createStorylineDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  sl: StoryLine[];
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description = {
    id: '', description_data: '', resource_type: 'storyline', resource_id: ''
  };

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<createStorylineDialogComponent>,
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
    const body = this.worldForm.value;
    body.world_id = this.wd.worldId;
    const desc: string = this.description.description_data ?? '';
    body.description = desc;
    this.api.createStoryLine(this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.wd.setLoading(false);
          this.wd.addStoryline(data);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
