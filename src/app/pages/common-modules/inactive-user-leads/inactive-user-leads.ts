import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Search, SearchFieldConfig } from '../../../shared/search/search';
import { Button } from '../../../shared/button/button';
import { Userservice } from '../../../service/userservice';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-inactive-user-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar, Pageheader, DataTable, Search, Button],
  templateUrl: './inactive-user-leads.html',
  styleUrl: './inactive-user-leads.css',
})
export class InactiveUserLeads implements OnInit {
  @ViewChild(Search) searchComponent?: Search;
  headerTitle = 'Assign Inactive User leads';

  headerBreadcrumbs = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Assign Inactive User leads' }
  ];

  rows: any[] = [];
  filteredRows: any[] = [];
  activeUsers: any[] = [];
  selectedTargetUserId: number | null = null;
  activeUserSearchText = '';
  isTargetUserDropdownOpen = false;
  selectedLeadIds: number[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 1;

  columns = [
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Lead User', field: 'inactiveUserFullName' },
    { header: 'Customer', field: 'customerName' },
    { header: 'Contact Person', field: 'contactFirstName' },
    { header: 'Status', field: 'status' },
    { header: 'ACTIONS', field: 'selected', type: 'checkbox' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'ownerId', label: 'Select Owner', type: 'select', searchable: true, options: [], placeholder: 'Select Owner' },
    { key: 'regionId', label: 'Select Region', type: 'select', searchable: true, options: [], placeholder: 'Select Region' },
    { key: 'stateId', label: 'Select State', type: 'select', searchable: true, options: [], placeholder: 'Select State' },
    { key: 'districtId', label: 'Select District', type: 'select', searchable: true, options: [], placeholder: 'Select District' },
    { key: 'cityId', label: 'Select City', type: 'select', searchable: true, options: [], placeholder: 'Select City' }
  ];

  constructor(
    private userService: Userservice,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadActiveUsers();
    this.loadDropdowns();
  }

  loadData(): void {
    this.userService.getInactiveUserLeads().subscribe({
      next: (data) => {
        this.rows = data || [];
        this.filteredRows = [...this.rows];
        this.totalElements = this.filteredRows.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;
      },
      error: (err) => {
        console.error('Failed to load inactive user leads:', err);
        this.toastService.show('Failed to load inactive user leads', 'error');
      }
    });
  }

  loadActiveUsers(): void {
    this.userService.getActiveUsersDropdown().subscribe({
      next: (data) => {
        this.activeUsers = data || [];
        const userField = this.searchFields.find(f => f.key === 'targetUserId');
        if (userField) {
          userField.options = (data || []).map(u => ({ label: u.name, value: u.id }));
        }
      },
      error: (err) => {
        console.error('Failed to load active users dropdown:', err);
      }
    });
  }

  loadDropdowns(): void {
    // Inactive owners
    this.userService.getInactiveOwnersDropdown().subscribe(data => {
      const ownerField = this.searchFields.find(f => f.key === 'ownerId');
      if (ownerField) {
        ownerField.options = (data || []).map(o => ({ label: o.name, value: o.id }));
      }
    });

    // Regions
    this.userService.getLocationsByLevel(4).subscribe(data => {
      const regionField = this.searchFields.find(f => f.key === 'regionId');
      if (regionField) {
        regionField.options = (data || []).map(r => ({ label: r.locationName, value: r.locationId }));
      }
    });
  }

  onFieldChange(event: { key: string; value: any }): void {
    if (event.key === 'targetUserId') {
      this.selectedTargetUserId = event.value;
      return;
    }
    if (event.key === 'regionId') {
      const stateField = this.searchFields.find(f => f.key === 'stateId');
      const districtField = this.searchFields.find(f => f.key === 'districtId');
      const cityField = this.searchFields.find(f => f.key === 'cityId');

      if (stateField) stateField.options = [];
      if (districtField) districtField.options = [];
      if (cityField) cityField.options = [];

      if (event.value) {
        this.userService.getLocationsByLevel(5, Number(event.value)).subscribe(data => {
          if (stateField) stateField.options = (data || []).map(s => ({ label: s.locationName, value: s.locationId }));
        });
      }
    } else if (event.key === 'stateId') {
      const districtField = this.searchFields.find(f => f.key === 'districtId');
      const cityField = this.searchFields.find(f => f.key === 'cityId');

      if (districtField) districtField.options = [];
      if (cityField) cityField.options = [];

      if (event.value) {
        this.userService.getLocationsByLevel(6, Number(event.value)).subscribe(data => {
          if (districtField) districtField.options = (data || []).map(d => ({ label: d.locationName, value: d.locationId }));
        });
      }
    } else if (event.key === 'districtId') {
      const cityField = this.searchFields.find(f => f.key === 'cityId');
      if (cityField) cityField.options = [];

      if (event.value) {
        this.userService.getLocationsByLevel(7, Number(event.value)).subscribe(data => {
          if (cityField) cityField.options = (data || []).map(c => ({ label: c.locationName, value: c.locationId }));
        });
      }
    }
  }

  onSearch(values: any): void {
    if (!values) {
      this.filteredRows = [...this.rows];
    } else {
      this.filteredRows = this.rows.filter(r => {
        let match = true;

        if (values.ownerId && Number(r.inactiveUserId) !== Number(values.ownerId)) {
          match = false;
        }
        if (values.regionId && Number(r.regionId) !== Number(values.regionId)) {
          match = false;
        }
        if (values.stateId && Number(r.stateId) !== Number(values.stateId)) {
          match = false;
        }
        if (values.districtId && Number(r.districtId) !== Number(values.districtId)) {
          match = false;
        }
        if (values.cityId && Number(r.cityId) !== Number(values.cityId)) {
          match = false;
        }
        if (values.searchKeyword) {
          const q = values.searchKeyword.toLowerCase().trim();
          const qMatch = (r.leadId && r.leadId.toString().includes(q)) ||
            (r.customerName && r.customerName.toLowerCase().includes(q)) ||
            (r.inactiveUserFullName && r.inactiveUserFullName.toLowerCase().includes(q));
          if (!qMatch) match = false;
        }

        return match;
      });
    }

    this.totalElements = this.filteredRows.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;
    this.currentPage = 1;
  }

  onReset(): void {
    if (this.searchComponent) {
      this.searchComponent.clear();
    }

    this.selectedTargetUserId = null;
    this.activeUserSearchText = '';
    this.isTargetUserDropdownOpen = false;

    if (this.rows) {
      this.rows.forEach(r => r.selected = false);
    }

    this.filteredRows = [...this.rows];
    this.totalElements = this.filteredRows.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;
    this.currentPage = 1;
  }

  onAssignRow(row: any): void {
    if (!this.selectedTargetUserId) {
      this.toastService.show('Please select a target active user from the dropdown above first!', 'warning');
      return;
    }

    const payload = {
      leadIds: [row.leadId],
      targetUserId: Number(this.selectedTargetUserId)
    };

    this.userService.rerouteInactiveLeads(payload).subscribe({
      next: (res) => {
        this.toastService.show(res.message || `Lead #${row.leadId} successfully re-assigned!`, 'success');
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to re-assign lead:', err);
        this.toastService.show('Failed to re-assign lead', 'error');
      }
    });
  }

  onRerouteLeads(): void {
    if (!this.selectedTargetUserId) {
      this.toastService.show('Please select a target active user from the dropdown above first!', 'warning');
      return;
    }

    const selectedRows = this.filteredRows.filter(r => r.selected === true);
    if (!selectedRows || selectedRows.length === 0) {
      this.toastService.show('Please select at least one lead using the checkboxes under ACTIONS column', 'warning');
      return;
    }

    const leadIds = selectedRows.map(r => r.leadId);

    const payload = {
      leadIds: leadIds,
      targetUserId: Number(this.selectedTargetUserId)
    };

    this.userService.rerouteInactiveLeads(payload).subscribe({
      next: (res) => {
        this.toastService.show(res.message || 'Leads successfully re-assigned!', 'success');
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to re-assign leads:', err);
        this.toastService.show('Failed to re-assign leads', 'error');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;
  }

  get filteredActiveUsers(): any[] {
    if (!this.activeUserSearchText.trim()) return this.activeUsers;
    const q = this.activeUserSearchText.toLowerCase();
    return this.activeUsers.filter(u => u.name && u.name.toLowerCase().includes(q));
  }

  getSelectedTargetUserName(): string {
    if (!this.selectedTargetUserId) return 'Select User';
    const found = this.activeUsers.find(u => Number(u.id) === Number(this.selectedTargetUserId));
    return found ? found.name : 'Select User';
  }

  selectTargetUser(user: any): void {
    this.selectedTargetUserId = user ? user.id : null;
    this.isTargetUserDropdownOpen = false;
  }
}
