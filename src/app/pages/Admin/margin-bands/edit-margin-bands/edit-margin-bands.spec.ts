import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMarginBandsComponent } from './edit-margin-bands';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Adminservice } from '../../../../service/adminservice';

describe('EditMarginBandsComponent', () => {
  let component: EditMarginBandsComponent;
  let fixture: ComponentFixture<EditMarginBandsComponent>;

  const adminServiceMock = {
    getMarginBandConfig: () => of({
      data: {
        marginBands: [
          {
            sno: 1,
            level: 'Auto approval',
            variance: '33 - 45',
            netMargin: '3 - 654',
            quoteApprovalId: 1,
            gmLowerLimit: 33,
            gmLowerCheck: 1,
            gmUpperLimit: 45,
            gmUpperCheck: 1,
            nmLowerLimit: 3,
            nmLowerCheck: 1,
            nmUpperLimit: 654,
            nmUpperCheck: 1
          }
        ],
        costOfMaintainingWarranty: '19%',
        costOfCapital: '199%',
        dealerWarranty: 'Disabled'
      }
    }),
    updateMarginBandConfig: () => of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMarginBandsComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: Adminservice, useValue: adminServiceMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMarginBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the edit form from the new margin config response', () => {
    expect(component.bandsArray.length).toBe(1);
    expect(component.editForm.get('costOfMaintainingWarranty')?.value).toBe(19);
    expect(component.editForm.get('costOfCapital')?.value).toBe(199);
    expect(component.editForm.get('dealerWarranty')?.value).toBeFalse();
    expect(component.bandsArray.at(0)?.get('varLowerLimit')?.value).toBe(33);
    expect(component.bandsArray.at(0)?.get('varUpperLimit')?.value).toBe(45);
    expect(component.bandsArray.at(0)?.get('netLowerLimit')?.value).toBe(3);
    expect(component.bandsArray.at(0)?.get('netUpperLimit')?.value).toBe(654);
  });
});
