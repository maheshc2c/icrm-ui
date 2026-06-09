import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLeads } from './edit-leads';

describe('EditLeads', () => {
  let component: EditLeads;
  let fixture: ComponentFixture<EditLeads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLeads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLeads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
