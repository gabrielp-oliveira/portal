import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperTableComponent } from './paper-table.component';

describe('PaperTableComponent', () => {
  let component: PaperTableComponent;
  let fixture: ComponentFixture<PaperTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaperTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaperTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
