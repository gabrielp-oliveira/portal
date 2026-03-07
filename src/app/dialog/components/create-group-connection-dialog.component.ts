import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, GroupConnection } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../utils.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-createGroupConnectionDialog',
  templateUrl: './createGroupConnectionDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createGroupConnectionDialogComponent {
  worldForm: FormGroup;
  gc: GroupConnection;
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private utils: UtilsService,
    private dialogRef: MatDialogRef<createGroupConnectionDialogComponent>,
    private errorHandler: ErrorService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
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
    const body: GroupConnection = this.worldForm.value;
    body.world_id = this.wd.worldId;
    body.color = '';
    this.api.createGroupConnection(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gc) => {
          this.wd.addGroupConnection(gc);
          this.wd.setLoading(false);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
