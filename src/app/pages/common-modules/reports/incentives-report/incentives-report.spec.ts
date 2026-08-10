import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncentivesReportComponent } from './incentives-report';

describe('IncentivesReportComponent', () => {
  let component: IncentivesReportComponent;
  let fixture: ComponentFixture<IncentivesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncentivesReportComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IncentivesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
