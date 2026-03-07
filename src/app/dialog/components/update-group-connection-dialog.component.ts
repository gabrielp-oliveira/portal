import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { GroupConnection } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../utils.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';

@Component({
  standalone: false,
  selector: 'app-updateGroupConnection',
  templateUrl: './updateGroupConnectionDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class updateGroupConnectionDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private utils: UtilsService,
    private dialogRef: MatDialogRef<updateGroupConnectionDialogComponent>,
    private errorHandler: ErrorService,
    @Inject(MAT_DIALOG_DATA) public data: GroupConnection,
    private dialog: DialogService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: [''],
    });
    this.worldForm.patchValue({ name: data.name, color: data.color });
  }

  deleteGroupConnection() {
    this.dialog.openDeleteGroupConnection(this.data, '150ms', '150ms');
  }

  chapterBackgroundColor(color: string) {
    return { 'background-color': color };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body: GroupConnection = { ...this.data, ...this.worldForm.value };
    this.api.updateGroupConnection(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gc) => {
          this.wd.setLoading(false);
          this.wd.updateGroupConnection(gc);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
