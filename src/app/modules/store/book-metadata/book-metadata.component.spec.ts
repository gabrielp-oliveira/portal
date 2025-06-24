import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookMetadataComponent } from './book-metadata.component';

describe('BookMetadataComponent', () => {
  let component: BookMetadataComponent;
  let fixture: ComponentFixture<BookMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookMetadataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
