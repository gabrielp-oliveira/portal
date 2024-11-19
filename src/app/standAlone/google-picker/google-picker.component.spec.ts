import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GooglePickerComponent } from './google-picker.component';

describe('GooglePickerComponent', () => {
  let component: GooglePickerComponent;
  let fixture: ComponentFixture<GooglePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GooglePickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GooglePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
