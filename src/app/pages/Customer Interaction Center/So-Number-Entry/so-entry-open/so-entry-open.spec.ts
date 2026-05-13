import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoEntryOpen } from './so-entry-open';

describe('SoEntryOpen', () => {
  let component: SoEntryOpen;
  let fixture: ComponentFixture<SoEntryOpen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoEntryOpen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoEntryOpen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
