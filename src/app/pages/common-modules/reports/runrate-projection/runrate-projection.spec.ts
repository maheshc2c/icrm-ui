import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunrateProjectionComponent } from './runrate-projection';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('RunrateProjectionComponent', () => {
  let component: RunrateProjectionComponent;
  let fixture: ComponentFixture<RunrateProjectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunrateProjectionComponent, ReactiveFormsModule, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunrateProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 12 financial year months', () => {
    expect(component.months.length).toBe(12);
  });

  it('should start with Apr-26', () => {
    expect(component.months[0]).toBe('Apr-26');
  });

  it('should end with Mar-27', () => {
    expect(component.months[11]).toBe('Mar-27');
  });

  it('should default to graph view', () => {
    expect(component.viewMode).toBe('graph');
  });

  it('should return default dataset when no filter is selected', () => {
    const ds = component.getActiveDataset();
    expect(ds).toEqual(component.mockDatasets['default']);
  });

  it('should return north dataset when north region is selected', () => {
    component.filterForm.get('region')?.setValue('north');
    const ds = component.getActiveDataset();
    expect(ds).toEqual(component.mockDatasets['north']);
  });

  it('should return oracle dataset when oracle product is selected', () => {
    component.filterForm.get('product')?.setValue('oracle');
    const ds = component.getActiveDataset();
    expect(ds).toEqual(component.mockDatasets['oracle']);
  });

  it('should generate correct chart title for East region', () => {
    component.filterForm.get('region')?.setValue('east');
    const title = component.getChartTitle();
    expect(title).toBe('East Wise Run Rate Projection 2026-27');
  });

  it('should generate correct chart title for Oracle product', () => {
    component.filterForm.get('product')?.setValue('oracle');
    const title = component.getChartTitle();
    expect(title).toBe('Oracle Run Rate Projection 2026-27');
  });

  it('should generate default chart title when no filter selected', () => {
    const title = component.getChartTitle();
    expect(title).toBe('Run Rate Projection 2026-27');
  });

  it('should calculate getTotalFor correctly', () => {
    const total = component.getTotalFor('closedWon');
    expect(typeof total).toBe('number');
  });

  it('should build table rows with 12 entries', () => {
    expect(component.tableRows.length).toBe(12);
  });
});
