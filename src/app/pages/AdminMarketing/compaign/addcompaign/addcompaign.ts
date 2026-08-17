import { Component, OnInit } from '@angular/core';
import { adminMarketingservice } from '../../../../service/adminmarketingservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ToastService } from '../../../../service/toast.service';
import { ConfirmDialogService } from '../../../../service/confirm-dialog.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-add-compaign',
  imports: [Pageheader, Header, Sidebar, CommonModule, FormsModule],
  templateUrl: './addcompaign.html',
  styleUrls: ['./addcompaign.css'],
})
export class AddCompaign implements OnInit {

  /* ================= HEADER ================= */
  headerTitle = 'Add New Campaign';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= STATE ================= */
  isEditMode = false;
  campaignId!: number;
  isSaving = false;

  /* ================= FORM DATA ================= */
  formData: any = {
    campaignType: 'offline',
    offline: {
      campaignName: '',
      campaignDescription: '',
      campaignDate: '',
      selectedSpecialities: [] as string[],
      selectedGeos: [] as string[],
      selectedCountries: [] as string[],
      selectedRegions: [] as string[],
      selectedStates: [] as string[],
      selectedDistricts: [] as string[],
      selectedCities: [] as string[]
    },
    mass_mailing: {
      campaignName: '',
      campaignDescription: '',
      campaignDate: '',
      mailTo: '',
      campaignSubject: '',
      campaignMailContent: '',
      attachment: null,
      selectedSpecialities: [] as string[],
      selectedGeos: [] as string[],
      selectedCountries: [] as string[],
      selectedRegions: [] as string[],
      selectedStates: [] as string[],
      selectedDistricts: [] as string[],
      selectedCities: [] as string[]
    }
  };

  /* ================= DROPDOWN OPTIONS ================= */
  specialityOptions: any[] = [];
  geoOptions: any[] = [];
  countryOptions: { offline: any[]; mass_mailing: any[] } = { offline: [], mass_mailing: [] };
  regionOptions: { offline: any[]; mass_mailing: any[] } = { offline: [], mass_mailing: [] };
  stateOptions: { offline: any[]; mass_mailing: any[] } = { offline: [], mass_mailing: [] };
  districtOptions: { offline: any[]; mass_mailing: any[] } = { offline: [], mass_mailing: [] };
  cityOptions: { offline: any[]; mass_mailing: any[] } = { offline: [], mass_mailing: [] };

  /* ================= DROPDOWN STATES ================= */
  dropdowns: any = {
    offline: { speciality: false, geo: false, country: false, region: false, state: false, district: false, city: false },
    mass_mailing: { speciality: false, geo: false, country: false, region: false, state: false, district: false, city: false }
  };

  searchQueries: any = {
    offline: { speciality: '', geo: '', country: '', region: '', state: '', district: '', city: '' },
    mass_mailing: { speciality: '', geo: '', country: '', region: '', state: '', district: '', city: '' }
  };

  contactsCountDisp: { offline: string; mass_mailing: string } = { offline: '', mass_mailing: '' };
  selectedFileName: string = 'No file chosen';
  errors: any = {};
  submitted = false;

  onFieldChange(): void {
    if (this.submitted) {
      this.validateForm();
    }
  }

  /* ================= INIT ================= */
  constructor(
    private adminMarketingservice: adminMarketingservice,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.campaignId = +id;
      this.headerTitle = 'Edit Campaign';
      this.loadCampaignById(this.campaignId);
    }

    this.headerBreadcrumbs = [
      { label: 'Home', route: '/adminmarketingdashboard' },
      { label: 'Admin Marketing', route: '/adminmarketingdashboard' },
      { label: 'Manage Campaign', route: '/adminmarketing/compaign' },
      { label: this.isEditMode ? 'Edit Campaign' : 'Add New Campaign' }
    ];
  }

  /* ================= LOAD DROPDOWNS ================= */
  private loadDropdowns(): void {
    this.adminMarketingservice.getSpecialities().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
        this.specialityOptions = list.map((s: any) => ({
          value: s.specialityName || s.name || '',
          label: s.specialityName || s.name || '',
          specialityId: s.specialityId ?? s.id
        }));
      }
    });

    this.adminMarketingservice.getGeos().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
        this.geoOptions = list.map((g: any) => ({
          value: g.locationName || g.name || '',
          label: g.locationName || g.name || '',
          locationId: g.locationId ?? g.id
        }));
      }
    });
  }

  /* ================= LOAD CAMPAIGN (EDIT) ================= */
  private loadCampaignById(id: number): void {
    this.adminMarketingservice.getCampaignById(id).subscribe({
      next: (res: any) => {
        const campaign = res?.data || res;

        if (campaign) {
          const type = (campaign.type === 1 || campaign.campaignType === 'Mass Mailing') ? 'mass_mailing' : 'offline';
          this.formData.campaignType = type;
          this.formData[type].campaignName = campaign.name || campaign.campaignName || '';
          this.formData[type].campaignDescription = campaign.description || campaign.campaignDescription || '';
          this.formData[type].campaignDate = campaign.campaignDate || '';
          this.formData[type].campaignSubject = campaign.subject || '';
          this.formData[type].selectedSpecialities = campaign.specialities
            ? (typeof campaign.specialities === 'string'
                ? campaign.specialities.split(', ')
                : campaign.specialities.map((s: any) => s?.specialityName || s?.name || s))
            : [];

          // Map locations sequentially by checking options hierarchy
          const locNames: string[] = campaign.locations || [];
          if (locNames.length > 0) {
            this.mapLocationsSequentially(type, locNames);
          }
        } else {
          this.toastService.error('Campaign not found');
          this.router.navigate(['/adminmarketing/compaign']);
        }
      },
      error: () => {
        this.toastService.error('Failed to load campaign');
        this.router.navigate(['/adminmarketing/compaign']);
      }
    });
  }

  private mapLocationsSequentially(type: 'offline' | 'mass_mailing', locNames: string[]): void {
    const currentFormData = this.formData[type];

    // 1. Find geos
    const matchedGeos = this.geoOptions.filter(g => locNames.includes(g.label) || locNames.includes(g.value));
    if (matchedGeos.length > 0) {
      currentFormData.selectedGeos = matchedGeos.map(g => g.value);
      
      // Load countries
      this.adminMarketingservice.getCountries(matchedGeos[0].locationId).subscribe(countries => {
        this.countryOptions[type] = countries.map((c: any) => ({
          value: c.locationName || c.name || '',
          label: c.locationName || c.name || '',
          locationId: c.locationId ?? c.id
        }));
        
        const matchedCountries = this.countryOptions[type].filter((c: any) => locNames.includes(c.label));
        if (matchedCountries.length > 0) {
          currentFormData.selectedCountries = matchedCountries.map((c: any) => c.value);

          // Load regions
          this.adminMarketingservice.getRegions(matchedCountries[0].locationId).subscribe(regions => {
            this.regionOptions[type] = regions.map((r: any) => ({
              value: r.locationName || r.name || '',
              label: r.locationName || r.name || '',
              locationId: r.locationId ?? r.id
            }));

            const matchedRegions = this.regionOptions[type].filter((r: any) => locNames.includes(r.label));
            if (matchedRegions.length > 0) {
              currentFormData.selectedRegions = matchedRegions.map((r: any) => r.value);

              // Load states
              this.adminMarketingservice.getStates(matchedRegions[0].locationId).subscribe(states => {
                this.stateOptions[type] = states.map((s: any) => ({
                  value: s.locationName || s.name || '',
                  label: s.locationName || s.name || '',
                  locationId: s.locationId ?? s.id
                }));

                const matchedStates = this.stateOptions[type].filter((s: any) => locNames.includes(s.label));
                if (matchedStates.length > 0) {
                  currentFormData.selectedStates = matchedStates.map((s: any) => s.value);

                  // Load districts
                  this.adminMarketingservice.getDistricts(matchedStates[0].locationId).subscribe(districts => {
                    this.districtOptions[type] = districts.map((d: any) => ({
                      value: d.locationName || d.name || '',
                      label: d.locationName || d.name || '',
                      locationId: d.locationId ?? d.id
                    }));

                    const matchedDistricts = this.districtOptions[type].filter((d: any) => locNames.includes(d.label));
                    if (matchedDistricts.length > 0) {
                      currentFormData.selectedDistricts = matchedDistricts.map((d: any) => d.value);

                      // Load cities
                      this.adminMarketingservice.getCities(matchedDistricts[0].locationId).subscribe(cities => {
                        this.cityOptions[type] = cities.map((c: any) => ({
                          value: c.locationName || c.name || '',
                          label: c.locationName || c.name || '',
                          locationId: c.locationId ?? c.id
                        }));

                        const matchedCities = this.cityOptions[type].filter((c: any) => locNames.includes(c.label));
                        if (matchedCities.length > 0) {
                          currentFormData.selectedCities = matchedCities.map((c: any) => c.value);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  /* ================= SAVE ================= */
  onSubmit(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    this.submitted = true;

    if (!this.validateForm()) {
      this.isSaving = false;
      
      const errorKeys = Object.keys(this.errors);
      if (errorKeys.length > 0) {
        const firstErrorMessage = this.errors[errorKeys[0]];
        this.toastService.error(firstErrorMessage);
      }

      // Smooth scroll to the first element with validation error
      setTimeout(() => {
        const errorEl = document.querySelector('.validation-error');
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Focus input/dropdown element if possible
          const parentWrap = errorEl.closest('.form-control-wrap');
          if (parentWrap) {
            const input = parentWrap.querySelector('input, textarea, .ms-wrap') as HTMLElement;
            if (input) {
              input.focus();
            }
          }
        }
      }, 100);
      return;
    }

    const currentCampaignType = this.formData.campaignType;
    const currentFormData = this.formData[currentCampaignType];

    const campaignTypeNum = currentCampaignType === 'mass_mailing' ? 1 : 0;

    // Resolve specialityIds from selected speciality names
    const specialityIds: number[] = (currentFormData.selectedSpecialities || [])
      .map((name: string) => {
        const found = this.specialityOptions.find((s: any) => s.value === name || s.label === name);
        return found?.specialityId ?? null;
      })
      .filter((id: any) => id !== null);

    // Resolve locationIds from all selected location levels
    const allSelectedLocationNames: string[] = [
      ...(currentFormData.selectedGeos || []),
      ...(currentFormData.selectedCountries || []),
      ...(currentFormData.selectedRegions || []),
      ...(currentFormData.selectedStates || []),
      ...(currentFormData.selectedDistricts || []),
      ...(currentFormData.selectedCities || [])
    ];

    // Gather all location options to resolve IDs
    const allLocationOptions: any[] = [
      ...this.geoOptions,
      ...(this.countryOptions[currentCampaignType as 'offline' | 'mass_mailing'] || []),
      ...(this.regionOptions[currentCampaignType as 'offline' | 'mass_mailing'] || []),
      ...(this.stateOptions[currentCampaignType as 'offline' | 'mass_mailing'] || []),
      ...(this.districtOptions[currentCampaignType as 'offline' | 'mass_mailing'] || []),
      ...(this.cityOptions[currentCampaignType as 'offline' | 'mass_mailing'] || [])
    ];

    const locationIds: number[] = allSelectedLocationNames
      .map((name: string) => {
        const found = allLocationOptions.find((l: any) => l.value === name || l.label === name);
        return found?.locationId ?? null;
      })
      .filter((id: any) => id !== null);

    // Build FormData for multipart/form-data (required by backend @ModelAttribute)
    const formData = new FormData();
    formData.append('type', String(campaignTypeNum));
    formData.append('name', currentFormData.campaignName || '');
    formData.append('description', currentFormData.campaignDescription || '');
    formData.append('campaignDate', currentFormData.campaignDate || '');

    specialityIds.forEach(id => formData.append('specialityIds', String(id)));
    locationIds.forEach(id => formData.append('locationIds', String(id)));

    if (currentCampaignType === 'mass_mailing') {
      formData.append('subject', currentFormData.campaignSubject || '');
      
      const mailContentHtml = document.getElementById('mail_content')?.innerHTML || '';
      formData.append('mailContent', mailContentHtml);

      // Parse comma-separated emails and append each as 'mailTo' for backend list binding
      const mailToStr = currentFormData.mailTo || '';
      const emails = mailToStr.split(',').map((e: string) => e.trim()).filter(Boolean);
      emails.forEach((email: string) => {
        formData.append('mailTo', email);
      });

      // Append actual files from FileList to FormData
      if (currentFormData.attachment && currentFormData.attachment.length > 0) {
        for (let i = 0; i < currentFormData.attachment.length; i++) {
          const file = currentFormData.attachment.item(i);
          if (file) {
            formData.append('attachments', file);
          }
        }
      }
    }

    this.adminMarketingservice.createCampaign(formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.success(`Campaign ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/adminmarketing/compaign']);
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Save failed:', err);
        if (err.status === 403) {
          this.toastService.error('Access Forbidden: Please check if you are logged in with the correct role.');
        } else {
          this.toastService.error('Save failed: ' + (err.error?.message || err.message || 'Server error'));
        }
      }
    });
  }

  onCancel(): void {
    this.confirmService.confirm({
      title: 'Confirm',
      message: 'Are you sure you want to cancel?'
    }).then((confirmed) => {
      if (confirmed) {
        this.router.navigate(['/adminmarketing/compaign']);
      }
    });
  }

  /* ================= DROPDOWN HANDLERS ================= */
  toggleDropdown(campaignType: 'offline' | 'mass_mailing', field: string, event: Event): void {
    event.stopPropagation();
    const currentState = this.dropdowns[campaignType][field];
    Object.keys(this.dropdowns[campaignType]).forEach(k => this.dropdowns[campaignType][k] = false);
    this.dropdowns[campaignType][field] = !currentState;
  }

  closeAllDropdowns(): void {
    Object.keys(this.dropdowns).forEach(type => {
      Object.keys(this.dropdowns[type]).forEach(field => {
        this.dropdowns[type][field] = false;
      });
    });
  }

  selectOption(campaignType: 'offline' | 'mass_mailing', field: string, value: string, event: Event): void {
    event.stopPropagation();
    const selectedArr = this.getArrayByField(field, campaignType);
    
    if (field === 'speciality') {
      // Speciality: Support multi-selection
      const index = selectedArr.indexOf(value);
      if (index === -1) {
        selectedArr.push(value);
      } else {
        selectedArr.splice(index, 1);
      }
    } else {
      // Cascading dropdowns: now support multi-selection too
      const index = selectedArr.indexOf(value);
      if (index === -1) {
        selectedArr.push(value);
      } else {
        selectedArr.splice(index, 1);
      }

      if (field === 'geo') this.onGeoSelectionChange(campaignType);
      if (field === 'country') this.onCountrySelectionChange(campaignType);
      if (field === 'region') this.onRegionSelectionChange(campaignType);
      if (field === 'state') this.onStateSelectionChange(campaignType);
      if (field === 'district') this.onDistrictSelectionChange(campaignType);
    }
    this.onFieldChange();
  }

  removeTag(campaignType: 'offline' | 'mass_mailing', field: string, value: string, event: Event): void {
    event.stopPropagation();
    const selectedArr = this.getArrayByField(field, campaignType);
    const index = selectedArr.indexOf(value);
    if (index > -1) selectedArr.splice(index, 1);

    if (field === 'geo') this.onGeoSelectionChange(campaignType);
    if (field === 'country') this.onCountrySelectionChange(campaignType);
    if (field === 'region') this.onRegionSelectionChange(campaignType);
    if (field === 'state') this.onStateSelectionChange(campaignType);
    if (field === 'district') this.onDistrictSelectionChange(campaignType);
    this.onFieldChange();
  }

  private getArrayByField(field: string, campaignType: 'offline' | 'mass_mailing'): string[] {
    const currentFormData = this.formData[campaignType];
    switch (field) {
      case 'speciality': return currentFormData.selectedSpecialities;
      case 'geo': return currentFormData.selectedGeos;
      case 'country': return currentFormData.selectedCountries;
      case 'region': return currentFormData.selectedRegions;
      case 'state': return currentFormData.selectedStates;
      case 'district': return currentFormData.selectedDistricts;
      case 'city': return currentFormData.selectedCities;
      default: return [];
    }
  }

  isOptionSelected(campaignType: 'offline' | 'mass_mailing', field: string, value: string): boolean {
    return this.getArrayByField(field, campaignType).includes(value);
  }

  /* ================= CASCADING DROPDOWNS ================= */
  onGeoSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    this.countryOptions[campaignType] = [];
    this.regionOptions[campaignType] = [];
    this.stateOptions[campaignType] = [];
    this.districtOptions[campaignType] = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedGeos.length > 0) {
      const matchedGeos = this.geoOptions.filter(g => currentFormData.selectedGeos.includes(g.value));
      const requests = matchedGeos.map(g => this.adminMarketingservice.getCountries(g.locationId));

      forkJoin(requests).subscribe((results: any[]) => {
        const combined: any[] = [];
        const seenIds = new Set<number>();
        results.forEach((countries: any[]) => {
          if (Array.isArray(countries)) {
            countries.forEach((c: any) => {
              const id = c.locationId ?? c.id;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({
                  value: c.locationName || c.name || '',
                  label: c.locationName || c.name || '',
                  locationId: id
                });
              }
            });
          }
        });
        this.countryOptions[campaignType] = combined;

        // Cleanup deselected children
        const validValues = combined.map(x => x.value);
        currentFormData.selectedCountries = currentFormData.selectedCountries.filter((v: string) => validValues.includes(v));
        this.onCountrySelectionChange(campaignType);
      });
    } else {
      currentFormData.selectedCountries = [];
      this.onCountrySelectionChange(campaignType);
    }
  }

  onCountrySelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    this.regionOptions[campaignType] = [];
    this.stateOptions[campaignType] = [];
    this.districtOptions[campaignType] = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedCountries.length > 0) {
      const matchedCountries = this.countryOptions[campaignType].filter(c => currentFormData.selectedCountries.includes(c.value));
      const requests = matchedCountries.map(c => this.adminMarketingservice.getRegions(c.locationId));

      forkJoin(requests).subscribe((results: any[]) => {
        const combined: any[] = [];
        const seenIds = new Set<number>();
        results.forEach((regions: any[]) => {
          if (Array.isArray(regions)) {
            regions.forEach((r: any) => {
              const id = r.locationId ?? r.id;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({
                  value: r.locationName || r.name || '',
                  label: r.locationName || r.name || '',
                  locationId: id
                });
              }
            });
          }
        });
        this.regionOptions[campaignType] = combined;

        // Cleanup deselected children
        const validValues = combined.map(x => x.value);
        currentFormData.selectedRegions = currentFormData.selectedRegions.filter((v: string) => validValues.includes(v));
        this.onRegionSelectionChange(campaignType);
      });
    } else {
      currentFormData.selectedRegions = [];
      this.onRegionSelectionChange(campaignType);
    }
  }

  onRegionSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    this.stateOptions[campaignType] = [];
    this.districtOptions[campaignType] = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedRegions.length > 0) {
      const matchedRegions = this.regionOptions[campaignType].filter(r => currentFormData.selectedRegions.includes(r.value));
      const requests = matchedRegions.map(r => this.adminMarketingservice.getStates(r.locationId));

      forkJoin(requests).subscribe((results: any[]) => {
        const combined: any[] = [];
        const seenIds = new Set<number>();
        results.forEach((states: any[]) => {
          if (Array.isArray(states)) {
            states.forEach((s: any) => {
              const id = s.locationId ?? s.id;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({
                  value: s.locationName || s.name || '',
                  label: s.locationName || s.name || '',
                  locationId: id
                });
              }
            });
          }
        });
        this.stateOptions[campaignType] = combined;

        // Cleanup deselected children
        const validValues = combined.map(x => x.value);
        currentFormData.selectedStates = currentFormData.selectedStates.filter((v: string) => validValues.includes(v));
        this.onStateSelectionChange(campaignType);
      });
    } else {
      currentFormData.selectedStates = [];
      this.onStateSelectionChange(campaignType);
    }
  }

  onStateSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    this.districtOptions[campaignType] = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedStates.length > 0) {
      const matchedStates = this.stateOptions[campaignType].filter(s => currentFormData.selectedStates.includes(s.value));
      const requests = matchedStates.map(s => this.adminMarketingservice.getDistricts(s.locationId));

      forkJoin(requests).subscribe((results: any[]) => {
        const combined: any[] = [];
        const seenIds = new Set<number>();
        results.forEach((districts: any[]) => {
          if (Array.isArray(districts)) {
            districts.forEach((d: any) => {
              const id = d.locationId ?? d.id;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({
                  value: d.locationName || d.name || '',
                  label: d.locationName || d.name || '',
                  locationId: id
                });
              }
            });
          }
        });
        this.districtOptions[campaignType] = combined;

        // Cleanup deselected children
        const validValues = combined.map(x => x.value);
        currentFormData.selectedDistricts = currentFormData.selectedDistricts.filter((v: string) => validValues.includes(v));
        this.onDistrictSelectionChange(campaignType);
      });
    } else {
      currentFormData.selectedDistricts = [];
      this.onDistrictSelectionChange(campaignType);
    }
  }

  onDistrictSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedDistricts.length > 0) {
      const matchedDistricts = this.districtOptions[campaignType].filter(d => currentFormData.selectedDistricts.includes(d.value));
      const requests = matchedDistricts.map(d => this.adminMarketingservice.getCities(d.locationId));

      forkJoin(requests).subscribe((results: any[]) => {
        const combined: any[] = [];
        const seenIds = new Set<number>();
        results.forEach((cities: any[]) => {
          if (Array.isArray(cities)) {
            cities.forEach((c: any) => {
              const id = c.locationId ?? c.id;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({
                  value: c.locationName || c.name || '',
                  label: c.locationName || c.name || '',
                  locationId: id
                });
              }
            });
          }
        });
        this.cityOptions[campaignType] = combined;

        // Cleanup deselected children
        const validValues = combined.map(x => x.value);
        currentFormData.selectedCities = currentFormData.selectedCities.filter((v: string) => validValues.includes(v));
      });
    } else {
      currentFormData.selectedCities = [];
    }
  }

  /* ================= HELPER METHODS ================= */
  selectType(type: string): void {
    this.formData.campaignType = type;
    this.closeAllDropdowns();
  }

  getFilteredOptions(campaignType: 'offline' | 'mass_mailing', field: string, options: any[]): any[] {
    const query = (this.searchQueries[campaignType][field] || '').toLowerCase();
    if (!query) return options;
    return options.filter(o => o.label.toLowerCase().includes(query));
  }

  onGetContacts(): void {
    const campaignType = this.formData.campaignType as 'offline' | 'mass_mailing';
    const currentData = this.formData[campaignType];
    
    // Find the lowest level location selected to fetch contacts for
    let selectedLocationId: number | null = null;
    let selectedLocationName = '';

    if (currentData.selectedCities.length > 0) {
      const option = this.cityOptions[campaignType]?.find((c: any) => c.value === currentData.selectedCities[0]);
      if (option) {
        selectedLocationId = option.locationId;
        selectedLocationName = option.label;
      }
    } else if (currentData.selectedDistricts.length > 0) {
      const option = this.districtOptions[campaignType]?.find((d: any) => d.value === currentData.selectedDistricts[0]);
      if (option) {
        selectedLocationId = option.locationId;
        selectedLocationName = option.label;
      }
    } else if (currentData.selectedStates.length > 0) {
      const option = this.stateOptions[campaignType]?.find((s: any) => s.value === currentData.selectedStates[0]);
      if (option) {
        selectedLocationId = option.locationId;
        selectedLocationName = option.label;
      }
    } else if (currentData.selectedRegions.length > 0) {
      const option = this.regionOptions[campaignType]?.find((r: any) => r.value === currentData.selectedRegions[0]);
      if (option) {
        selectedLocationId = option.locationId;
        selectedLocationName = option.label;
      }
    } else if (currentData.selectedCountries.length > 0) {
      const option = this.countryOptions[campaignType]?.find((c: any) => c.value === currentData.selectedCountries[0]);
      if (option) {
        selectedLocationId = option.locationId;
        selectedLocationName = option.label;
      }
    } else if (currentData.selectedGeos.length > 0) {
      const option = this.geoOptions.find((g: any) => g.value === currentData.selectedGeos[0]);
      if (option) {
        selectedLocationId = option.locationId;
        selectedLocationName = option.label;
      }
    }

    if (!selectedLocationId) {
      this.toastService.error('Please select a GEO or location first');
      this.contactsCountDisp[campaignType] = 'Please select a GEO or location first';
      return;
    }

    this.contactsCountDisp[campaignType] = 'Loading contacts...';

    this.adminMarketingservice.getCampaignContacts(selectedLocationId).subscribe({
      next: (res: any) => {
        // The API returns ApiResponse<List<String>>
        const emailList: string[] = res?.data || [];
        
        if (campaignType === 'mass_mailing') {
          this.formData.mass_mailing.mailTo = emailList.join(', ');
        }

        if (emailList.length === 0) {
          this.contactsCountDisp[campaignType] = `No contacts found for selected location: ${selectedLocationName}`;
        } else {
          this.contactsCountDisp[campaignType] = `${emailList.length} contacts loaded from ${selectedLocationName}`;
        }
      },
      error: (err) => {
        console.error('Error fetching campaign contacts:', err);
        this.contactsCountDisp[campaignType] = 'Failed to load contacts from location';
      }
    });
  }

  onMailContentChange(event: Event): void {
    const target = event.target as HTMLElement;
    this.formData.mass_mailing.campaignMailContent = target.innerHTML;
    this.onFieldChange();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formData.mass_mailing.attachment = input.files;
      this.selectedFileName = input.files.length > 1 
        ? `${input.files.length} files selected` 
        : input.files[0].name;
    } else {
      this.selectedFileName = 'No file chosen';
    }
  }

  /* ================= RICH TEXT EDITOR ================= */
  formatText(cmd: string): void {
    document.execCommand(cmd, false, '');
  }

  formatBlock(event: any): void {
    const val = event.target.value;
    if (val) {
      document.execCommand('formatBlock', false, val);
      event.target.value = '';
    }
  }

  applyFontSize(event: any): void {
    const val = event.target.value;
    if (val) {
      document.execCommand('fontSize', false, val);
      event.target.value = '';
    }
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
  }

  insertImage(): void {
    const url = prompt('Enter image URL:');
    if (url) document.execCommand('insertImage', false, url);
  }

  /* ================= FORM VALIDATION ================= */
  validateForm(): boolean {
    const type = this.formData.campaignType as 'offline' | 'mass_mailing';
    const currentData = this.formData[type];
    const newErrors: any = {};

    let isValid = true;

    if (!currentData.campaignName || !currentData.campaignName.trim()) {
      newErrors.campaignName = 'Campaign Name is required';
      isValid = false;
    }

    if (!currentData.campaignDate) {
      newErrors.campaignDate = 'Campaign Date is required';
      isValid = false;
    }

    // Speciality and GEO are required in both campaign types
    if (!currentData.selectedSpecialities || currentData.selectedSpecialities.length === 0) {
      newErrors.selectedSpecialities = 'Speciality is required';
      isValid = false;
    }

    if (!currentData.selectedGeos || currentData.selectedGeos.length === 0) {
      newErrors.selectedGeos = 'GEO is required';
      isValid = false;
    }

    if (type === 'mass_mailing') {
      if (!currentData.campaignSubject || !currentData.campaignSubject.trim()) {
        newErrors.campaignSubject = 'Subject is required';
        isValid = false;
      }
      const mailContentHtml = document.getElementById('mail_content')?.innerHTML || '';
      if (!mailContentHtml || !mailContentHtml.trim() || mailContentHtml === '<br>') {
        newErrors.mailContent = 'Mail Content is required';
        isValid = false;
      }
      if (!currentData.mailTo || !currentData.mailTo.trim()) {
        newErrors.mailTo = 'Recipients are required. Please click "Get Contacts" to search and load recipients.';
        isValid = false;
      }
    }

    this.errors = newErrors;
    return isValid;
  }
}
