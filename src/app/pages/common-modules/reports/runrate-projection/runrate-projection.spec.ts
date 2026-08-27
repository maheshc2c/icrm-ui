import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunrateProjectionComponent } from './runrate-projection';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RunrateProjectionComponent', () => {
  let component: RunrateProjectionComponent;
  let fixture: ComponentFixture<RunrateProjectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunrateProjectionComponent, ReactiveFormsModule, FormsModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunrateProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to graph view', () => {
    expect(component.viewMode).toBe('graph');
  });

  it('should process API response correctly', () => {
    const mockData = {
      xaxisLabel: 'Run Rate Projection 2026–27',
      xaxisCategory: ['Apr-26<br>(72.9%)', 'May-26<br>(0.0%)'],
      chartSeries: [
        { name: 'Max Conversion Rate(98.0%)', data: [0.0, 0.0], color: '#097054' },
        { name: 'Open Opportunities', data: [13.5, 0.0], color: '#6599FF' }
      ],
      tableRows: [
        { monthName: 'Apr-26', newOppVal: 13.5, newSaleVal: 9.84, conversionRate: 72.89, maxConVal: 0.0, minConVal: 0.0 },
        { monthName: 'May-26', newOppVal: 0.0, newSaleVal: 0.0, conversionRate: 0.0, maxConVal: 0.0, minConVal: 0.0 }
      ]
    };

    component.processApiResponse(mockData);

    expect(component.currentTitle).toBe('Run Rate Projection 2026–27');
    expect(component.tableRows.length).toBe(2);
    expect(component.tableRows[0].month).toBe('April');
    expect(component.tableRows[0].funnel).toBe(13.5);
  });

  it('should calculate getTotalFor correctly', () => {
    component.tableRows = [
      { funnel: 10, closedWon: 5 },
      { funnel: 20, closedWon: 15 }
    ];
    expect(component.getTotalFor('funnel')).toBe(30);
    expect(component.getTotalFor('closedWon')).toBe(20);
  });
});
