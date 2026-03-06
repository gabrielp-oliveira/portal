import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniverseCheckoutComponent } from './universe-checkout.component';

describe('UniverseCheckoutComponent', () => {
  let component: UniverseCheckoutComponent;
  let fixture: ComponentFixture<UniverseCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UniverseCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniverseCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
