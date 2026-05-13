import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalBranchHead } from './regional-branch-head';

describe('RegionalBranchHead', () => {
  let component: RegionalBranchHead;
  let fixture: ComponentFixture<RegionalBranchHead>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionalBranchHead]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionalBranchHead);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
