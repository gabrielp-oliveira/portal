import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Connection, GroupConnection } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../utils.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-updateConnectionDialog',
  templateUrl: './updateConnectionDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class updateConnectionDialogComponent {
  worldForm: FormGroup;
  gc: GroupConnection[];
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private utils: UtilsService,
    private dialogRef: MatDialogRef<updateConnectionDialogComponent>,
    private errorHandler: ErrorService,
    @Inject(MAT_DIALOG_DATA) public cnn: Connection
  ) {
    this.wd.groupConnection$.pipe(takeUntil(this.destroy$)).subscribe((c) => this.gc = c);
    this.worldForm = this.fb.group({
      groupConnection: ['', [Validators.required, Validators.minLength(3)]],
    });
    this.worldForm.patchValue({ groupConnection: this.cnn.group_id });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chapterBackgroundColor(color: String) {
    return { 'background-color': color };
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body: GroupConnection = this.worldForm.value;
    body.world_id = this.wd.worldId;
    body.color = this.utils.numberToHex(this.cnn.id);
    this.cnn.group_id = this.worldForm.value.groupConnection;
    this.api.updateConnection(this.cnn)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gcs) => {
          this.wd.setLoading(false);
          this.wd.updateConnection(gcs);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
