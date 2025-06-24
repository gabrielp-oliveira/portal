import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversePageComponent } from './universe-page.component';

describe('UniversePageComponent', () => {
  let component: UniversePageComponent;
  let fixture: ComponentFixture<UniversePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UniversePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
