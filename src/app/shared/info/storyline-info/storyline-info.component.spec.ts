import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorylineInfoComponent } from './storyline-info.component';

describe('StorylineInfoComponent', () => {
  let component: StorylineInfoComponent;
  let fixture: ComponentFixture<StorylineInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorylineInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorylineInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
