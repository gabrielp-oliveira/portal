import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { description, infoDialog } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';

@Component({
  standalone: false,
  selector: 'app-createPaperDialog',
  templateUrl: './createPaperDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createPaperDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  worldId: string = '';
  Showloading: Observable<boolean> = this.wd.loading$;
  description: description;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<createPaperDialogComponent>,
    private errorHandler: ErrorService,
    private dialog: DialogService,
    private wd: WorldDataService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: [''],
    });
    this.worldForm.setValue({ name: '', color: '' });
    this.wd.world$.pipe(takeUntil(this.destroy$)).subscribe((w) => this.worldId = String(w?.id));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  onSubmit() {
    if (!this.worldForm.valid) {
      const info: infoDialog = {
        status: 'warning',
        action: 'create Paper',
        message: 'fill all the required fields in the form.',
        header: 'not able to create paper'
      };
      this.dialog.openInfoDialog(info);
      return;
    }
    this.wd.setLoading(true);
    const body = this.worldForm.value;
    body.world_id = this.worldId;
    this.api.createPaper(this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (paper) => {
          this.wd.setLoading(false);
          if (!!paper.chapter) {
            this.wd.addChapter(paper.chapter[0]);
          }
          delete paper.chapter;
          this.wd.addPaper(paper);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
