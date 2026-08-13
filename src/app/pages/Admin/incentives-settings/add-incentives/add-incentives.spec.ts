import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AddIncentives } from './add-incentives';

describe('AddIncentives', () => {
  let component: AddIncentives;
  let fixture: ComponentFixture<AddIncentives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncentives],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIncentives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
