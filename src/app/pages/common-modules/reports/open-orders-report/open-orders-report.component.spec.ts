import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenOrdersReportComponent } from './open-orders-report.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('OpenOrdersReportComponent', () => {
  let component: OpenOrdersReportComponent;
  let fixture: ComponentFixture<OpenOrdersReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenOrdersReportComponent, ReactiveFormsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OpenOrdersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
