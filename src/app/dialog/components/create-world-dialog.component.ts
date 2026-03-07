import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { createWorld, description, infoDialog } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { DialogService } from '../dialog.service';

@Component({
  standalone: false,
  selector: 'app-createWorldDialog',
  templateUrl: './createWorldRootDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class createWorldDialogComponent {
  worldForm: FormGroup;
  destroy$ = new Subject<void>();
  description: description;
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private dialogRef: MatDialogRef<createWorldDialogComponent>,
    private dialog: DialogService,
    private errorHandler: ErrorService
  ) {
    this.worldForm = this.fb.group({ name: ['', [Validators.required]] });
    this.description = { id: '', resource_type: 'world' };
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body = this.worldForm.value;
    const desc: string = this.description.description_data ?? '';
    body.description = desc;
    this.api.Createworld(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (w: createWorld) => {
          const info: infoDialog = { ...w };
          setTimeout(() => {
            this.dialog.openInfoDialog(info);
            this.wd.setLoading(false);
            this.dialogRef.close();
            const url = `/world/${w.world.id}}`;
            window.open(url, '_blank');
          }, 2000);
        },
        error: (err) => this.errorHandler.errHandler(err)
      });
  }
}
