import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedBooksComponent } from './recommended-books.component';

describe('RecommendedBooksComponent', () => {
  let component: RecommendedBooksComponent;
  let fixture: ComponentFixture<RecommendedBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedBooksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecommendedBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
