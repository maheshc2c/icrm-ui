import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminManageUsers } from './superadmin-manage-users';

describe('SuperadminManageUsers', () => {
  let component: SuperadminManageUsers;
  let fixture: ComponentFixture<SuperadminManageUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminManageUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminManageUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
