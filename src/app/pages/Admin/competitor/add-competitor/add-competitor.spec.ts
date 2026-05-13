import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompetitor } from './add-competitor';

describe('AddCompetitor', () => {
  let component: AddCompetitor;
  let fixture: ComponentFixture<AddCompetitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCompetitor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCompetitor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
