import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoEntryClose } from './so-entry-close';

describe('SoEntryClose', () => {
  let component: SoEntryClose;
  let fixture: ComponentFixture<SoEntryClose>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoEntryClose]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoEntryClose);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
