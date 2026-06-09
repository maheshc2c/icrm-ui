import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Managedacument } from './managedacument';

describe('Managedacument', () => {
  let component: Managedacument;
  let fixture: ComponentFixture<Managedacument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Managedacument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Managedacument);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
