import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarginAnalysisReportComponent } from './margin-analysis-report';

describe('MarginAnalysisReportComponent', () => {
  let component: MarginAnalysisReportComponent;
  let fixture: ComponentFixture<MarginAnalysisReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarginAnalysisReportComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MarginAnalysisReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute total revenue and margin', () => {
    expect(component.totalRevenue).toBe(37);
    expect(component.totalMargin).toBe(-81.46);
  });
});
