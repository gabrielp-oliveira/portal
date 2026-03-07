import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Chapter, description, infoDialog, paper } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../utils.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';
import { TxtEditorComponent } from '../../shared/txt-editor/txt-editor.component';

@Component({
  standalone: false,
  selector: 'app-createPaperDialog',
  templateUrl: './createChapterDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createChapterDialogComponent {
  worldForm: FormGroup;
  description: description;
  @ViewChild(TxtEditorComponent) txtEditor!: TxtEditorComponent;

  worldId: string | undefined = '';
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;

  papers$ = this.wd.papers$;
  chapters$ = this.wd.chapters$;
  world$ = this.wd.world$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<createChapterDialogComponent>,
    private dialog: DialogService,
    private utils: UtilsService,
    private errorHandler: ErrorService,
    private wd: WorldDataService
  ) {
    this.worldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      paper_id: ['', [Validators.required]],
    });
    this.description = { id: '', resource_type: 'chapter', resource_id: '' };
    this.wd.world$.pipe(takeUntil(this.destroy$)).subscribe((w) => this.worldId = w?.id);
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  chapterBackgroundColor(pp: paper) {
    return { 'background-color': pp.color || this.utils.numberToHex(pp.id) };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (!this.worldForm.valid) {
      const info: infoDialog = {
        status: 'warning',
        action: 'create chapter',
        message: 'fill all the required fields in the form.',
        header: 'not able to create chapter'
      };
      this.dialog.openInfoDialog(info);
      return;
    }
    this.wd.setLoading(true);
    const body = this.worldForm.value;
    body.world_id = this.worldId;
    body.description = this.description.description_data;
    this.api.createChapter(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.wd.setLoading(false);
          this.addNewChapter(data);
          this.dialogRef.close();
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }

  addNewChapter(newChapter: Chapter) {
    const info: infoDialog = {
      status: 'success',
      action: 'CreateChapter',
      message: 'you successfully create chapter ' + newChapter.title,
      header: 'chapter created'
    };
    this.dialog.openInfoDialog(info);
    this.wd.addChapter(newChapter);
  }
}
