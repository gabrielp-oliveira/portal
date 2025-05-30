import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadWorldComponent } from './read-world.component';

describe('ReadWorldComponent', () => {
  let component: ReadWorldComponent;
  let fixture: ComponentFixture<ReadWorldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadWorldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadWorldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
