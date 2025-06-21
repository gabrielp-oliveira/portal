import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniverseCardComponent } from './universe-card.component';

describe('UniverseCardComponent', () => {
  let component: UniverseCardComponent;
  let fixture: ComponentFixture<UniverseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniverseCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UniverseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
