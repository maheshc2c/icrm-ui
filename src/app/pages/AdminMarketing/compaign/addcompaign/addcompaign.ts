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
          value: s.specialityName,
          label: s.specialityName
        }));
      }
    });

    this.adminMarketingservice.getGeos().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
        this.geoOptions = list.map((g: any) => ({
          value: g.locationName,
          label: g.locationName,
          locationId: g.locationId
        }));
      }
    });
  }

  /* ================= LOAD CAMPAIGN (EDIT) ================= */
  private loadCampaignById(id: number): void {
    this.adminMarketingservice.getCampaigns().subscribe({
      next: (res: any) => {
        // ✅ Handle paginated response (res.content) or direct array
        const campaigns = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
        const campaign = campaigns.find((c: any) => c.campaignId === id);

        if (campaign) {
          const type = campaign.campaignType === 1 ? 'mass_mailing' : 'offline';
          this.formData.campaignType = type;
          this.formData[type].campaignName = campaign.campaignName || '';
          this.formData[type].campaignDescription = campaign.campaignDescription || '';
          this.formData[type].campaignDate = campaign.campaignDate || '';
          this.formData[type].selectedSpecialities = campaign.specialities?.map((s: any) => s.specialityName) || [];
        } else {
          this.toastService.error('Campaign not found');
          this.router.navigate(['/adminmarketing/compaign']);
        }
      },
      error: () => {
        this.toastService.error('Failed to load campaigns');
        this.router.navigate(['/adminmarketing/compaign']);
      }
    });
  }

  /* ================= SAVE ================= */
  onSubmit(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    const currentCampaignType = this.formData.campaignType;
    const currentFormData = this.formData[currentCampaignType];

    const campaignTypeNum = currentCampaignType === 'mass_mailing' ? 1 : 0;

    const payload: any = {
      campaignType: campaignTypeNum,
      campaignName: currentFormData.campaignName,
      campaignDescription: currentFormData.campaignDescription,
      campaignDate: currentFormData.campaignDate,
      campaignStatus: 1,
      specialityName: currentFormData.selectedSpecialities[0] || '',
      geoNames: currentFormData.selectedGeos,
      countryNames: currentFormData.selectedCountries,
      regionNames: currentFormData.selectedRegions,
      stateNames: currentFormData.selectedStates,
      districtNames: currentFormData.selectedDistricts,
      cityNames: currentFormData.selectedCities
    };

    if (currentCampaignType === 'mass_mailing') {
      payload.campaignSubject = currentFormData.campaignSubject || '';
      payload.campaignMailContent = document.getElementById('mail_content')?.innerHTML || '';
    }

    this.adminMarketingservice.createCampaign(payload).subscribe({
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
          this.toastService.error('Save failed: ' + (err.message || 'Server error'));
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
      // Cascading dropdowns: Single selection
      selectedArr.length = 0;
      selectedArr.push(value);
      this.dropdowns[campaignType][field] = false;

      if (field === 'geo') this.onGeoSelectionChange(campaignType);
      if (field === 'country') this.onCountrySelectionChange(campaignType);
      if (field === 'region') this.onRegionSelectionChange(campaignType);
      if (field === 'state') this.onStateSelectionChange(campaignType);
      if (field === 'district') this.onDistrictSelectionChange(campaignType);
    }
  }

  removeTag(campaignType: 'offline' | 'mass_mailing', field: string, value: string, event: Event): void {
    event.stopPropagation();
    const selectedArr = this.getArrayByField(field, campaignType);
    const index = selectedArr.indexOf(value);
    if (index > -1) selectedArr.splice(index, 1);

    if (field === 'geo') this.onGeoSelectionChange(campaignType);
    if (field === 'country') this.onCountrySelectionChange(campaignType);
    if (field === 'region') this.onRegionSelectionChange(campaignType);
    if (field === 'district') this.onDistrictSelectionChange(campaignType);
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
    currentFormData.selectedCountries = [];
    this.countryOptions[campaignType] = [];
    currentFormData.selectedRegions = [];
    this.regionOptions[campaignType] = [];
    currentFormData.selectedStates = [];
    this.stateOptions[campaignType] = [];
    currentFormData.selectedDistricts = [];
    this.districtOptions[campaignType] = [];
    currentFormData.selectedCities = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedGeos.length > 0) {
      const selectedGeo = currentFormData.selectedGeos[0];
      const geoOption = this.geoOptions.find(g => g.label === selectedGeo || g.locationName === selectedGeo);
      if (geoOption) {
        this.adminMarketingservice.getCountries(geoOption.locationId).subscribe(data => {
          this.countryOptions[campaignType] = data.map((c: any) => ({ value: c.locationName, label: c.locationName, locationId: c.locationId }));
        });
      }
    }
  }

  onCountrySelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    currentFormData.selectedRegions = [];
    this.regionOptions[campaignType] = [];
    currentFormData.selectedStates = [];
    this.stateOptions[campaignType] = [];
    currentFormData.selectedDistricts = [];
    this.districtOptions[campaignType] = [];
    currentFormData.selectedCities = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedCountries.length > 0) {
      const selectedCountry = currentFormData.selectedCountries[0];
      const countryOption = this.countryOptions[campaignType].find((c: any) => c.value === selectedCountry);
      if (countryOption) {
        this.adminMarketingservice.getRegions(countryOption.locationId).subscribe(data => {
          this.regionOptions[campaignType] = data.map((r: any) => ({ value: r.locationName, label: r.locationName, locationId: r.locationId }));
        });
      }
    }
  }

  onRegionSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    currentFormData.selectedStates = [];
    this.stateOptions[campaignType] = [];
    currentFormData.selectedDistricts = [];
    this.districtOptions[campaignType] = [];
    currentFormData.selectedCities = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedRegions.length > 0) {
      const selectedRegion = currentFormData.selectedRegions[0];
      const regionOption = this.regionOptions[campaignType].find((r: any) => r.value === selectedRegion);
      if (regionOption) {
        this.adminMarketingservice.getStates(regionOption.locationId).subscribe(data => {
          this.stateOptions[campaignType] = data.map((s: any) => ({ value: s.locationName, label: s.locationName, locationId: s.locationId }));
        });
      }
    }
  }

  onStateSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    currentFormData.selectedDistricts = [];
    this.districtOptions[campaignType] = [];
    currentFormData.selectedCities = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedStates.length > 0) {
      const selectedState = currentFormData.selectedStates[0];
      const stateOption = this.stateOptions[campaignType].find((s: any) => s.value === selectedState);
      if (stateOption) {
        this.adminMarketingservice.getDistricts(stateOption.locationId).subscribe(data => {
          this.districtOptions[campaignType] = data.map((d: any) => ({ value: d.locationName, label: d.locationName, locationId: d.locationId }));
        });
      }
    }
  }

  onDistrictSelectionChange(campaignType: 'offline' | 'mass_mailing'): void {
    const currentFormData = this.formData[campaignType];
    currentFormData.selectedCities = [];
    this.cityOptions[campaignType] = [];

    if (currentFormData.selectedDistricts.length > 0) {
      const selectedDistrict = currentFormData.selectedDistricts[0];
      const districtOption = this.districtOptions[campaignType].find((d: any) => d.value === selectedDistrict);
      if (districtOption) {
        this.adminMarketingservice.getCities(districtOption.locationId).subscribe(data => {
          this.cityOptions[campaignType] = data.map((c: any) => ({ value: c.locationName, label: c.locationName, locationId: c.locationId }));
        });
      }
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
    
    this.contactsCountDisp[campaignType] = 'Loading contacts...';
    
    this.adminMarketingservice.getContact().subscribe({
      next: (res: any) => {
        const allContacts = Array.isArray(res) ? res : (res?.content || (res ? [res] : []));
        console.log('DEBUG: Total contacts fetched:', allContacts.length);
        
        // If no filters are selected, include everything
        const noFilters = currentData.selectedSpecialities.length === 0 && 
                         currentData.selectedGeos.length === 0 &&
                         currentData.selectedCountries.length === 0 &&
                         currentData.selectedRegions.length === 0 &&
                         currentData.selectedStates.length === 0 &&
                         currentData.selectedDistricts.length === 0 &&
                         currentData.selectedCities.length === 0;

        // Filter contacts based on selected specialities and locations
        const filteredContacts = allContacts.filter((contact: any) => {
          if (noFilters) return true;

          let matchesSpeciality = true;
          let matchesLocation = true;

          // 1. Speciality Filter
          if (currentData.selectedSpecialities.length > 0) {
            const contactSpec = (
              contact.specialityName || 
              contact.speciality?.specialityName || 
              contact.customer?.specialityName || 
              ''
            ).toLowerCase().trim();
            
            matchesSpeciality = currentData.selectedSpecialities.some((s: string) => {
              const filterVal = s.toLowerCase().trim();
              return filterVal === contactSpec || contactSpec.includes(filterVal) || filterVal.includes(contactSpec);
            });
          }

          // 2. Location Filter
          const hasLocationFilter = currentData.selectedGeos.length > 0 || 
                                   currentData.selectedCountries.length > 0 || 
                                   currentData.selectedRegions.length > 0 || 
                                   currentData.selectedStates.length > 0 || 
                                   currentData.selectedDistricts.length > 0 || 
                                   currentData.selectedCities.length > 0;

          if (hasLocationFilter) {
            // Collect all possible location strings from this contact
            const locPool: string[] = [];
            
            // From locations array
            if (contact.customer?.locations) {
              contact.customer.locations.forEach((l: any) => {
                if (l.locationName) locPool.push(l.locationName.toLowerCase().trim());
              });
            }

            // From address fields
            const addrFields = [
              contact.contactAddress1, contact.contactAddress2, contact.contactState, contact.contactCountry,
              contact.customer?.customerAddress1, contact.customer?.customerAddress2, contact.customer?.customerAddress3,
              contact.customer?.locationCity, contact.customer?.locationState, contact.customer?.locationCountry, contact.customer?.locationGeo
            ];
            
            addrFields.forEach(f => {
              if (f) locPool.push(f.toLowerCase().trim());
            });

            // Helper to check if any selected item matches any item in the pool
            const checkMatch = (selected: string[]) => {
              if (selected.length === 0) return false;
              return selected.some(sel => {
                const s = sel.toLowerCase().trim();
                return locPool.some(lp => lp.includes(s) || s.includes(lp));
              });
            };

            const cityMatch = checkMatch(currentData.selectedCities);
            const stateMatch = checkMatch(currentData.selectedStates);
            const countryMatch = checkMatch(currentData.selectedCountries);
            const geoMatch = checkMatch(currentData.selectedGeos);
            const regionMatch = checkMatch(currentData.selectedRegions);
            const districtMatch = checkMatch(currentData.selectedDistricts);

            // Pass if ANY selected level has a match
            matchesLocation = false;
            if (currentData.selectedCities.length > 0) matchesLocation = matchesLocation || cityMatch;
            if (currentData.selectedStates.length > 0) matchesLocation = matchesLocation || stateMatch;
            if (currentData.selectedCountries.length > 0) matchesLocation = matchesLocation || countryMatch;
            if (currentData.selectedGeos.length > 0) matchesLocation = matchesLocation || geoMatch;
            if (currentData.selectedRegions.length > 0) matchesLocation = matchesLocation || regionMatch;
            if (currentData.selectedDistricts.length > 0) matchesLocation = matchesLocation || districtMatch;
          }

          return matchesSpeciality && matchesLocation;
        });

        // Extract unique emails
        const uniqueEmails = new Set<string>();
        filteredContacts.forEach((c: any) => {
          const email = c.contactEmail || c.customer?.customerEmail || '';
          if (email && email.includes('@')) {
            uniqueEmails.add(email.trim());
          }
        });

        const emailsArray = Array.from(uniqueEmails);

        if (campaignType === 'mass_mailing') {
          this.formData.mass_mailing.mailTo = emailsArray.join(', ');
        }

        if (emailsArray.length === 0 && allContacts.length > 0 && !noFilters) {
          this.contactsCountDisp[campaignType] = `No contacts matched your filters. (Checked ${allContacts.length} total)`;
        } else {
          this.contactsCountDisp[campaignType] = `${emailsArray.length} contacts found and added to recipient list`;
        }
        console.log('DEBUG: Final Filtered count:', emailsArray.length);
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
        this.contactsCountDisp[campaignType] = 'Failed to load contacts';
      }
    });
  }

  onMailContentChange(event: Event): void {
    const target = event.target as HTMLElement;
    this.formData.mass_mailing.campaignMailContent = target.innerHTML;
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
}
