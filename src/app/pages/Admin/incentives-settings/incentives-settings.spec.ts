import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IncentivesSettings } from './incentives-settings';

describe('IncentivesSettings', () => {
  let component: IncentivesSettings;
  let fixture: ComponentFixture<IncentivesSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentivesSettings],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentivesSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
