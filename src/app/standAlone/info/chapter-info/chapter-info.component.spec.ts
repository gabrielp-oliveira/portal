import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterInfoComponent } from './chapter-info.component';

describe('ChapterInfoComponent', () => {
  let component: ChapterInfoComponent;
  let fixture: ComponentFixture<ChapterInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChapterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
