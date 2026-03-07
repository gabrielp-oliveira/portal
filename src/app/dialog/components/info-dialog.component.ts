import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { infoDialog } from '../../models/paperTrailTypes';
import { Observable, Subject } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-infoDialog',
  templateUrl: './infoDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class InfoDialogComponent {
  icon: string;
  destroy$ = new Subject<void>();
  color: string;
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: infoDialog,
    private wd: WorldDataService,
    private dialogRef: MatDialogRef<InfoDialogComponent>
  ) {
    if (data.status == 'error') {
      this.icon = 'crisis_alert';
      this.color = 'red';
    } else if (data.status == 'success') {
      this.icon = 'task_alt';
      this.color = 'green';
    } else if (data.status == 'warning') {
      this.icon = 'warning';
      this.color = 'orange';
    }
  }
}
