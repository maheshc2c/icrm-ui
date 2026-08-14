import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetVsSalesComponent } from './target-vs-sales';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('TargetVsSalesComponent', () => {
  let component: TargetVsSalesComponent;
  let fixture: ComponentFixture<TargetVsSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetVsSalesComponent, ReactiveFormsModule, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetVsSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to Month timeline', () => {
    expect(component.filterForm.get('timeline')?.value).toBe('Month');
  });

  it('should default to graph view', () => {
    expect(component.viewMode).toBe('graph');
  });

  it('should default to By Product report type', () => {
    expect(component.reportType).toBe('product');
  });

  it('should populate date options for Month timeline', () => {
    component.updateDateOptions('Month');
    expect(component.dateOptions.length).toBe(12);
  });

  it('should populate date options for Quarter timeline', () => {
    component.updateDateOptions('Quarter');
    expect(component.dateOptions.length).toBe(4);
  });

  it('should have no date options for Year timeline', () => {
    component.updateDateOptions('Year');
    expect(component.dateOptions.length).toBe(0);
  });

  it('should have table rows defined', () => {
    expect(component.tableRows.length).toBeGreaterThan(0);
  });

  it('should calculate getTotalFor correctly', () => {
    const total = component.getTotalFor('openOrders');
    expect(typeof total).toBe('number');
  });
});
