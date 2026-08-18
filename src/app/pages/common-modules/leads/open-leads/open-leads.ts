import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../../../shared/data-table/data-table';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Leadservice } from '../../../../service/leadservice';
import { LeadSummary } from '../../../../models/lead-model';

@Component({
  selector: 'app-open-leads',
  standalone: true,
  imports: [DataTable, CommonModule, FormsModule, Pageheader, Header, Sidebar],
  templateUrl: './open-leads.html',
  styleUrls: ['./open-leads.css']
})
export class OpenLeads implements OnInit {

  breadcrumbs = [
    { label: 'Home', route: '/sales-manager-dashboard' },
    { label: 'Open Leads' }
  ];

  searchFields: SearchFieldConfig[] = [
    { key: 'leadId', label: 'Lead ID', type: 'text', placeholder: 'Lead ID' },
    { key: 'customer', label: 'Customer', type: 'select', placeholder: 'Select Customer', options: [] },
    { key: 'status', label: 'Status', type: 'native-select', placeholder: 'Select Status', options: [
      { value: '1', label: 'Waiting for Approval' },
      { value: '2', label: 'Lead Approved' },
      { value: '3', label: 'Opportunity Created' },
      { value: '4', label: 'All Opportunities Dropped' },
      { value: '5', label: 'All Opportunities Lost or Dropped' },
      { value: '6', label: 'Partial Quote' },
      { value: '7', label: 'Full Quote' },
      { value: '8', label: 'Partial Contract Note - Partial Quote' },
      { value: '9', label: 'Partial Contract Note - Full Quote' },
      { value: '10', label: 'Full Contract Note' }
    ]},
    { key: 'startDate', label: 'Start Date', type: 'date', placeholder: 'Start Date' }
  ];

  columns = [
    { header: 'Lead ID', field: 'leadId' },
    { header: 'Customer', field: 'customer' },
    { header: 'Contact Person', field: 'contactPerson' },
    { header: 'Owner', field: 'owner' },
    { header: 'Life Time(Days)', field: 'lifeTime' },
    { header: 'Status', field: 'status' }
  ];

  originalLeads: LeadSummary[] = [];
  rows: any[] = [];
  
  currentPage = 1;
  pageSize = 10;
  totalElements: number = 0;

  constructor(
    private router: Router,
    private leadService: Leadservice
  ) { }

  ngOnInit(): void {
    this.loadLeads();
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.leadService.getCustomers().subscribe({
      next: (data: any[]) => {
        const customerField = this.searchFields.find(f => f.key === 'customer');
        if (customerField) {
          // ✅ Use unique customer names only
          const uniqueNames = [...new Set(data.map(c => c.customerName))];
          customerField.options = uniqueNames.map(name => ({ 
            value: name, 
            label: name 
          }));
        }
      },
      error: (err) => console.error('Error loading customers:', err)
    });
  }

  currentSearchParams: any = {};

  loadLeads(searchParams: any = this.currentSearchParams): void {
    this.leadService.getOpenLeads(this.currentPage - 1, this.pageSize, searchParams).subscribe({
      next: (res: any) => {
        const leadsData = res.data || res.content || (Array.isArray(res) ? res : []);
        this.totalElements = res.totalElements || leadsData.length;
        
        this.rows = leadsData.map((item: any) => ({
          leadId: item.leadId,
          customer: item.customerName || item.customer || 'N/A',
          contactPerson: item.contactPerson || item.contactFirstName || 'N/A',
          owner: item.owner || item.username || 'N/A',
          lifeTime: item.lifeTimeDays !== undefined ? item.lifeTimeDays : (item.lifeTime || 0),
          status: item.status !== undefined ? item.status : item.leadStatus,
          leadStatus: item.status !== undefined ? item.status : item.leadStatus,
          hasOpportunity: item.hasOpportunity,
          hasQuote: item.hasQuote,
          // hasCNote: item.hasCNote,
         
          //Fixed Stage Colour Issue, Once Stage is set has Completed the Status Bar Turns into Green
contractNoteStage:
  item.contractNoteStage ||
  item.cNoteStage ||
  item.contractNoteStatus ||
  '',

isContractNoteCompleted:
  String(
    item.contractNoteStage ||
    item.cNoteStage ||
    item.contractNoteStatus ||
    ''
  ).trim().toLowerCase() === 'completed',

hasCNote:
  item.hasCNote === true ||
  item.hasCNote === 1 ||
  item.hasCNote === 'true' ||
  item.hasCNote === '1' ||
  String(
    item.contractNoteStage ||
    item.cNoteStage ||
    item.contractNoteStatus ||
    ''
  ).trim().toLowerCase() === 'completed' ||
  item.status === 10 ||
  item.leadStatus === 10
    
        }));

this.rows.forEach((row: any) => {

  const payload = {
    leadId: String(row.leadId),
    pagination: {
      pageNumber: 0,
      pageSize: 100,
      sortBy: '',
      sortOrder: ''
    }
  };

  this.leadService.getContractNoteDetails(payload).subscribe({
    next: (response: any) => {

      const notes =
        response?.content ??
        response?.data?.content ??
        response?.data ??
        response?.contractNotes ??
        response;

      const contractNotes = Array.isArray(notes) ? notes : [];

      // const completedNote = contractNotes.find((note: any) =>
      //   String(
      //     note.stage ??
      //     note.status ??
      //     ''
      //   ).trim().toLowerCase() === 'completed'
      // );

      const completedNote = contractNotes.find((note: any) => {

  const soNumber =
    note.soNumber ??
    note.salesOrderNumber ??
    note.salesOrderNo ??
    '';

  const hasSoNumber =
    soNumber !== null &&
    soNumber !== undefined &&
    String(soNumber).trim() !== '' &&
    String(soNumber).trim().toLowerCase() !== 'n/a' &&
    String(soNumber).trim() !== '0';

  const stage =
    String(
      note.stage ??
      note.status ??
      ''
    ).trim().toLowerCase();

  return stage === 'completed' || hasSoNumber;
});

      if (completedNote) {
        row.hasCNote = true;
        row.isContractNoteCompleted = true;
        row.contractNoteStage = 'Completed';

        console.log(
          'C Note completed for Lead:',
          row.leadId
        );
      }
    },

    error: (err) => {
      console.error(
        'Failed to load Contract Note for Lead:',
        row.leadId,
        err
      );
    }
  });

});



        this.originalLeads = leadsData;
      },
      error: (err) => {
        console.error('Error loading leads:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLeads(this.currentSearchParams);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadLeads(this.currentSearchParams);
  }

  onSearch(filters: any): void {
    console.log('Search filters received:', filters);
    this.currentSearchParams = {
      leadId: filters.leadId ? Number(filters.leadId) : null,
      customerName: filters.customer || null,
      status: filters.status ? Number(filters.status) : null,
      startDate: filters.startDate || null
    };

    this.currentPage = 1;
    this.loadLeads(this.currentSearchParams);
  }

  onReset(): void {
    this.currentSearchParams = {};
    this.currentPage = 1;
    this.loadLeads({});
  }

  onAdd(): void {
    this.router.navigate(['/salesmanager/leads/add']);
  }

  onEdit(row: any): void {
    console.log('Edit lead:', row);
    this.router.navigate(['salesmanager/leads/edit', row.leadId]);
  }

  onDownload(): void {
    console.log('Downloading open leads...');
    if (!this.rows || this.rows.length === 0) {
      alert('No data to download');
      return;
    }

    // Try backend excel service first, fallback to client-side CSV
    this.leadService.downloadLeadsExcel(this.rows).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `open_leads_${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.warn('Backend download failed, using client-side CSV export:', err);
        this.exportClientCsv();
      }
    });
  }

  private exportClientCsv(): void {
    const headers = ['Lead ID', 'Customer', 'Contact Person', 'Owner', 'Life Time (Days)', 'Status'];
    const csvData: string[] = [headers.join(',')];

    this.rows.forEach(row => {
      let statusStr = 'Lead';
      const st = row.leadStatus !== undefined ? row.leadStatus : row.status;
      if (st === 1) statusStr = 'Waiting for Approval';
      else if (st === 2) statusStr = 'Lead Approved';
      else if (st === 3) statusStr = 'Opportunity Created';
      else if (st === 4) statusStr = 'All Opportunities Dropped';
      else if (st === 5) statusStr = 'All Opportunities Lost or Dropped';
      else if (st === 6) statusStr = 'Partial Quote';
      else if (st === 7) statusStr = 'Full Quote';
      else if (st === 8) statusStr = 'Partial Contract Note - Partial Quote';
      else if (st === 9) statusStr = 'Partial Contract Note - Full Quote';
      else if (st === 10) statusStr = 'Full Contract Note';

      const line = [
        `"${row.leadId || ''}"`,
        `"${(row.customer || '').replace(/"/g, '""')}"`,
        `"${(row.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(row.owner || '').replace(/"/g, '""')}"`,
        `"${row.lifeTime !== undefined ? row.lifeTime : 0}"`,
        `"${statusStr}"`
      ];
      csvData.push(line.join(','));
    });

    const blob = new Blob(['\uFEFF' + csvData.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `open_leads_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
