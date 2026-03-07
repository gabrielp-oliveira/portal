import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Chapter, infoDialog } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';

@Component({
  standalone: false,
  selector: 'app-deleteChapterDialog',
  templateUrl: './deleteChapterDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class deleteChapterDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;
  range: number = 1;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<deleteChapterDialogComponent>,
    private errorHandler: ErrorService,
    private dialog: DialogService,
    private wd: WorldDataService,
    @Inject(MAT_DIALOG_DATA) public data: Chapter
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
      this.api.deleteChapter(this.data.id).subscribe({
        next: (chp: Chapter) => {
          this.wd.removeChapter(chp.id);
          this.wd.setLoading(false);
          const info: infoDialog = {
            status: 'success',
            action: 'Delete Chapter',
            message: `you successfully deleted chapter ${chp.title}.`,
            header: 'chapter removed'
          };
          this.dialog.openInfoDialog(info);
          this.dialogRef.close();
        },
        error: (e) => {
          this.wd.setLoading(false);
          this.errorHandler.errHandler(e);
        }
      });
    }
  }
}
