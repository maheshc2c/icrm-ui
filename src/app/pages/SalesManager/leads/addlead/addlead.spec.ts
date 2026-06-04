import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addlead } from './addlead';

describe('Addlead', () => {
  let component: Addlead;
  let fixture: ComponentFixture<Addlead>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addlead]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addlead);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
