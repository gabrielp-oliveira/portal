import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCheckoutComponent } from './book-checkout.component';

describe('BookCheckoutComponent', () => {
  let component: BookCheckoutComponent;
  let fixture: ComponentFixture<BookCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCheckoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
