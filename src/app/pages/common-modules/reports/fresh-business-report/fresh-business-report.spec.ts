import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FreshBusinessReportComponent } from './fresh-business-report';
import { ReactiveFormsModule } from '@angular/forms';

describe('FreshBusinessReportComponent', () => {
  let component: FreshBusinessReportComponent;
  let fixture: ComponentFixture<FreshBusinessReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreshBusinessReportComponent, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreshBusinessReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to By Product view', () => {
    expect(component.filterForm.get('reportType')?.value).toBe('product');
  });

  it('should update date options when timeline changes', () => {
    component.filterForm.get('timeline')?.setValue('Month');
    expect(component.dateOptions.length).toBeGreaterThan(0);
  });

  it('should hide date dropdown when Year is selected', () => {
    component.filterForm.get('timeline')?.setValue('Year');
    expect(component.dateOptions.length).toBe(0);
  });

  it('should return correct chart title for By Product', () => {
    component.filterForm.get('reportType')?.setValue('product');
    component.filterForm.get('timeline')?.setValue('Year');
    const title = component.getChartTitle();
    expect(title).toContain('By Segment');
  });

  it('should return correct chart title for By Region', () => {
    component.filterForm.get('reportType')?.setValue('region');
    component.filterForm.get('timeline')?.setValue('Year');
    const title = component.getChartTitle();
    expect(title).toContain('By Region');
  });
});
