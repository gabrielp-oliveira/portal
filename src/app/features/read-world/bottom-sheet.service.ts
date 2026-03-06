import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';

@Injectable({ providedIn: 'root' })
export class BottomSheetService {
  constructor(private bottomSheet: MatBottomSheet) {}

  open(type: 'chapters' | 'books' | 'timelines') {
    this.bottomSheet.open(BottomSheetComponent, {
      data: { type },
      panelClass: 'custom-bottom-sheet',
    });
  }
  close() {
    this.bottomSheet.dismiss(BottomSheetComponent)
  }
}
