import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamation, faQuestion, faCheck, faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal',
  // standalone: true,
  // imports: [MatDialogModule, MatButtonModule, FontAwesomeModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  direction:'LTR' | 'RTL' | '' = 'LTR'
  constructor(public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; text: string; color: string }


  ) {

    this.dialogRef.beforeClosed().subscribe(() => {
      this.direction = 'RTL'
    })

    
    
  }
  handleClose(bol:Boolean){

  }
}