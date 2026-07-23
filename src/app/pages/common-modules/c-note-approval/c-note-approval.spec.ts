import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CNoteApproval } from './c-note-approval';

describe('CNoteApproval', () => {
  let component: CNoteApproval;
  let fixture: ComponentFixture<CNoteApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CNoteApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CNoteApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
