import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubwayComponent } from './subway.component';

describe('SubwayComponent', () => {
  let component: SubwayComponent;
  let fixture: ComponentFixture<SubwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubwayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
