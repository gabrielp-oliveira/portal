import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyStoreComponent } from './body-store.component';

describe('BodyStoreComponent', () => {
  let component: BodyStoreComponent;
  let fixture: ComponentFixture<BodyStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyStoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BodyStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
