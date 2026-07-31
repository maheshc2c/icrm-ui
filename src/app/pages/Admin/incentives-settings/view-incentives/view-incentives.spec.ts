import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ViewIncentives } from './view-incentives';

describe('ViewIncentives', () => {
  let component: ViewIncentives;
  let fixture: ComponentFixture<ViewIncentives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewIncentives],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIncentives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
