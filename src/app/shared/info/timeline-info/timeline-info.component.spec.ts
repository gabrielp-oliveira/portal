import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineInfoComponent } from './timeline-info.component';

describe('TimelineInfoComponent', () => {
  let component: TimelineInfoComponent;
  let fixture: ComponentFixture<TimelineInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimelineInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
