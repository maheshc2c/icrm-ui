import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addcp } from './addcp';

describe('Addcp', () => {
  let component: Addcp;
  let fixture: ComponentFixture<Addcp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addcp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addcp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
