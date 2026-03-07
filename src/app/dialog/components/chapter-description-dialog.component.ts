import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-chapterDescriptionDialog',
  templateUrl: './chapterDescriptionDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class chapteDescriptionDialogComponent {
  destroy$ = new Subject<void>();
  description: description;
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: description,
    private api: ApiService,
    private errorHandler: ErrorService,
    private dialogRef: MatDialogRef<chapteDescriptionDialogComponent>,
    private wd: WorldDataService
  ) {
    this.description = { id: '', resource_type: data.resource_type, resource_id: data.id };
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  updateDescription() {
    this.api.updateDescription(this.description)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => {
          this.wd.setLoading(false);
          this.description = d;
        },
        error: (e) => this.errorHandler.errHandler(e)
      });
  }
}
