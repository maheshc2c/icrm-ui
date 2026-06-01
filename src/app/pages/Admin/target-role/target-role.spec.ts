import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetRole } from './target-role';

describe('TargetRole', () => {
  let component: TargetRole;
  let fixture: ComponentFixture<TargetRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetRole]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetRole);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
