import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryHeadDashborad } from './country-head-dashborad';

describe('CountryHeadDashborad', () => {
  let component: CountryHeadDashborad;
  let fixture: ComponentFixture<CountryHeadDashborad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryHeadDashborad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryHeadDashborad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
