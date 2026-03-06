import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionGroupInfoComponent } from './connectionGroup-info.component';

describe('ConnectionGroupInfoComponent', () => {
  let component: ConnectionGroupInfoComponent;
  let fixture: ComponentFixture<ConnectionGroupInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionGroupInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConnectionGroupInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
