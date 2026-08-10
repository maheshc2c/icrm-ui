import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpportunityLostDashboardComponent } from './opportunity-lost-dashboard.component';

describe('OpportunityLostDashboardComponent', () => {
  let component: OpportunityLostDashboardComponent;
  let fixture: ComponentFixture<OpportunityLostDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityLostDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityLostDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the filter form', () => {
    expect(component.filterForm.get('region')?.value).toBe('All Regions');
    expect(component.filterForm.get('timeline')?.value).toBe('Week');
  });

  it('should aggregate totals from legend items', () => {
    expect(component.totalReason).toBe(75);
    expect(component.totalCompetitor).toBe(75);
  });
});
