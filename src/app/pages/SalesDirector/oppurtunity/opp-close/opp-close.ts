import { Component } from '@angular/core';
import { SearchFieldConfig } from '../../../../shared/search/search';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Header } from "../../../../layout/header/header";
import { Sidebar } from "../../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { DataTable } from "../../../../shared/data-table/data-table";

@Component({
  selector: 'app-opp-close',
  imports: [Header, Sidebar, Pageheader, DataTable],
  templateUrl: './opp-close.html',
  styleUrl: './opp-close.css',
})
export class OppClose {

  constructor(private router: Router) {}

  headerTitle = 'Closed Opportunities';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/sd-dashboard' },
    { label: 'Opportunity', route: '/salesdirector/opportunity' }
  ];

  // ✅ Table Columns
  columns = [
    { header: 'Lead Details', field: 'leadDetails' },
    { header: 'Product', field: 'product' },
    { header: 'Qty', field: 'qty' },
    { header: 'Value (Rs)', field: 'value' },
    { header: 'Stage', field: 'stage' },
    { header: 'Category', field: 'category' },
    { header: 'Probability', field: 'probability' },
    { header: 'Life Time (Days)', field: 'lifetime' },
  ];

  // ✅ Static Table Data
  rows: any[] = [
    {
      id: 1,
      leadDetails: 'ABC Pvt Ltd - Enquiry',
      product: 'Machine A',
      qty: 2,
      value: 50000,
      stage: 'Initial',
      category: 'Hot',
      probability: '70%',
      lifetime: 10
    },
    {
      id: 2,
      leadDetails: 'XYZ Corp - Demo',
      product: 'Machine B',
      qty: 1,
      value: 75000,
      stage: 'Demo',
      category: 'Warm',
      probability: '50%',
      lifetime: 7
    },
    {
      id: 3,
      leadDetails: 'Test Client - Follow-up',
      product: 'Machine C',
      qty: 5,
      value: 120000,
      stage: 'Negotiation',
      category: 'Cold',
      probability: '30%',
      lifetime: 15
    }
  ];

  // ✅ Search Fields (ALL FIXED WITH label)
  searchFields: SearchFieldConfig[] = [

    { key: 'oppId', label: '', placeholder: 'Opp ID', type: 'text' },

    {
      key: 'customer',
      label: '',
      placeholder: 'Select Customer',
      type: 'select',
      options: [
        { label: 'ABC Pvt Ltd', value: '1' },
        { label: 'XYZ Corp', value: '2' }
      ]
    },

    {
      key: 'productCategory',
      label: '',
      placeholder: 'Select Product Category',
      type: 'select',
      options: [
        { label: 'Category A', value: 'A' },
        { label: 'Category B', value: 'B' }
      ]
    },

    {
      key: 'stage',
      label: '',
      placeholder: 'Select Stage',
      type: 'select',
      options: [
        { label: 'Initial', value: 'initial' },
        { label: 'Demo', value: 'demo' },
        { label: 'Negotiation', value: 'negotiation' }
      ]
    },

    {
      key: 'stage2',
      label: '',
      placeholder: 'Select Stage (Alt)',
      type: 'select',
      options: [
        { label: 'Closed', value: 'closed' },
        { label: 'Lost', value: 'lost' }
      ]
    },

    {
      key: 'category',
      label: '',
      placeholder: 'Select Category',
      type: 'select',
      options: [
        { label: 'Hot', value: 'hot' },
        { label: 'Warm', value: 'warm' },
        { label: 'Cold', value: 'cold' }
      ]
    },

    {
      key: 'createdStart',
      label: '',
      placeholder: 'Opportunity Created Start Date',
      type: 'date'
    },

    {
      key: 'createdEnd',
      label: '',
      placeholder: 'Opportunity Created End Date',
      type: 'date'
    },

    {
      key: 'owner',
      label: '',
      placeholder: 'Select Owner',
      type: 'select',
      options: [
        { label: 'John', value: 'john' },
        { label: 'David', value: 'david' }
      ]
    },

    {
      key: 'region',
      label: '',
      placeholder: 'Select Region',
      type: 'select',
      options: [
        { label: 'South', value: 'south' },
        { label: 'North', value: 'north' }
      ]
    },

    {
      key: 'source',
      label: '',
      placeholder: 'Select Source of Lead',
      type: 'select',
      options: [
        { label: 'Website', value: 'web' },
        { label: 'Referral', value: 'ref' }
      ]
    },

    {
      key: 'orderStart',
      label: '',
      placeholder: 'Order Conclusion Start Date',
      type: 'date'
    },

    {
      key: 'orderEnd',
      label: '',
      placeholder: 'Order Conclusion End Date',
      type: 'date'
    },

    {
      key: 'searchAll',
      label: '',
      placeholder: 'Search All',
      type: 'text'
    },

    {
      key: 'searchText',
      label: '',
      placeholder: 'Select (Search by Text)',
      type: 'select',
      options: [
        { label: 'Lead Name', value: 'lead' },
        { label: 'Product', value: 'product' }
      ]
    }
  ];

  // ✅ Actions
  onAdd() {
    this.router.navigate(['salesdirector/opportunity/add']);
  }

  onEdit(row: any) {
    console.log('Edit:', row);
  }

  onDelete(row: any) {
    console.log('Delete:', row);
  }

  onImport() {}
  onSearch() {}

}
