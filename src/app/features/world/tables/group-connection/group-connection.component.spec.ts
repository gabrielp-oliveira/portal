import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupConnectionComponent } from './group-connection.component';

describe('GroupConnectionComponent', () => {
  let component: GroupConnectionComponent;
  let fixture: ComponentFixture<GroupConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupConnectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
