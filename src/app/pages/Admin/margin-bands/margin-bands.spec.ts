import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarginBandsComponent } from './margin-bands';
import { provideRouter } from '@angular/router';

describe('MarginBandsComponent', () => {
  let component: MarginBandsComponent;
  let fixture: ComponentFixture<MarginBandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarginBandsComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarginBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
