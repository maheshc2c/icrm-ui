import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTarget } from './upload-target';

describe('UploadTarget', () => {
  let component: UploadTarget;
  let fixture: ComponentFixture<UploadTarget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadTarget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadTarget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
