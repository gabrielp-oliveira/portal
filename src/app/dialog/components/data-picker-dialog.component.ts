import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'MM/DD/YYYY' },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-dataPickerDialog',
  templateUrl: './dataPickerDialog.component.html',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule
  ],
  styleUrls: ['./dialog.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class DataPickerDialogComponent {
  selected: Date | null;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  selectedDate: Date;

  onDateChange(event: any) {
    this.selectedDate = event.value;
  }
}
