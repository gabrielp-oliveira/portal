import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxtEditorComponent } from './txt-editor.component';

describe('TxtEditorComponent', () => {
  let component: TxtEditorComponent;
  let fixture: ComponentFixture<TxtEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TxtEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TxtEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
