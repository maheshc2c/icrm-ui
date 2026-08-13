import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralSettingsComponent } from './general-settings';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Adminservice } from '../../../service/adminservice';
import { ToastService } from '../../../service/toast.service';

describe('GeneralSettingsComponent', () => {
  let component: GeneralSettingsComponent;
  let fixture: ComponentFixture<GeneralSettingsComponent>;
  let toastService: ToastService;
  let adminService: jasmine.SpyObj<Adminservice>;

  beforeEach(async () => {
    adminService = jasmine.createSpyObj<Adminservice>('Adminservice', [
      'getGeneralSettings',
      'saveGeneralSettings'
    ]);

    adminService.getGeneralSettings.and.returnValue(of({ data: [] } as any));
    adminService.saveGeneralSettings.and.returnValue(of({ success: true } as any));

    await TestBed.configureTestingModule({
      imports: [GeneralSettingsComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: Adminservice, useValue: adminService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralSettingsComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.settingsForm).toBeDefined();
    expect(component.settingsForm.get('dealerWarranty')).toBeDefined();
  });

  it('should show a success toast after saving settings', () => {
    spyOn(toastService, 'success');
    component.settingsForm.patchValue({
      dealerWarranty: true,
      poDocumentsUpload: true,
      poUploadCheck: true,
      maxDiscount: 10,
      maxBalancePaymentDays: 20,
      defaultWarranty: 12,
      defaultBalancePayment: 30,
      defaultAdvance: 25,
      recordsPerPage: 50,
      costOfMaintainingWarranty: 5,
      costOfCapital: 8
    });

    component.onSave();

    expect(toastService.success).toHaveBeenCalledWith('General settings updated successfully.');
  });
});
