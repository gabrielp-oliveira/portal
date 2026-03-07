import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { GroupConnection } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';

@Component({
  standalone: false,
  selector: 'app-deleteGroupConnectionDialog',
  templateUrl: './deleteGroupConnectionDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class deleteGroupConnectionDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  range: number = 1;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private errorHandler: ErrorService,
    private dialog: DialogService,
    private wd: WorldDataService,
    private dialogRef: MatDialogRef<deleteGroupConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GroupConnection
  ) {
    this.worldForm = this.fb.group({ confirm: [false, [Validators.required]] });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    if (this.worldForm.value.confirm) {
      this.api.deleteGroupConnection(this.data.id, this.data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (results) => {
            this.wd.setConnections(results);
            this.wd.removeGroupConnection(this.data.id);
            this.wd.setLoading(false);
            this.dialogRef.close();
          }
        });
    }
  }
}
