import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMarginBandsComponent } from './edit-margin-bands';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

describe('EditMarginBandsComponent', () => {
  let component: EditMarginBandsComponent;
  let fixture: ComponentFixture<EditMarginBandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMarginBandsComponent, ReactiveFormsModule],
      providers: [provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMarginBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
