import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Header } from '../../../layout/header/header';
import { DataTable } from '../../../shared/data-table/data-table';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';


@Component({
  selector: 'app-marketing-doc',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader, Header, DataTable, Sidebar],
  templateUrl: './marketing-doc.html',
  styleUrl: './marketing-doc.css',
})
export class MarketingDoc {
  headerTitle = 'Marketing Documents';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'Marketing Documents', route: '/salesdirector/marketing-documents' }
  ];

  columns = [
    { header: 'Document Name', field: 'documentName' },
    { header: 'Description', field: 'description' },
    { header: 'Attachment', field: 'attachment' }
  ];

  rows: any[] = [];


  onSearch(): void {
    console.log('Form Submitted =>');
  }
   onSubmit(): void {
    console.log('Form Submitted =>');
  }



   searchFields: SearchFieldConfig[] = [
    {
      key: 'Name',
      label: 'Name',
      placeholder: 'Document Name',
      type: 'text'
    },
  ]

}
