import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OppClose } from './opp-close';

describe('OppClose', () => {
  let component: OppClose;
  let fixture: ComponentFixture<OppClose>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OppClose]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OppClose);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
