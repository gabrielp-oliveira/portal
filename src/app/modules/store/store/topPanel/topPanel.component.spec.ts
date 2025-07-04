import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderStoreComponent } from './topPanel.component';

describe('HeaderStoreComponent', () => {
  let component: HeaderStoreComponent;
  let fixture: ComponentFixture<HeaderStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderStoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
