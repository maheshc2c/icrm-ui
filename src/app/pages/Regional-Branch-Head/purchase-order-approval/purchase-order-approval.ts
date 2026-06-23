import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { DataTable } from '../../../shared/data-table/data-table';
import { Adminservice } from '../../../service/adminservice';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../../models/breadcrumb';
import { SearchFieldConfig } from '../../../shared/search/search';

@Component({
  selector: 'app-purchase-order-approval',
  imports: [CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable],
  templateUrl: './purchase-order-approval.html',
  styleUrl: './purchase-order-approval.css',
})
export class PurchaseOrderApproval {


   constructor(
    private adminservice: Adminservice,
    private router: Router
  ) {}

  headerTitle = 'Purchase Order Approval';

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Purchase Order Approval', route: '/admin/purchase-order-approval' }
  ];

  columns = [
    { header: 'Distributor', field: 'distributor' },
    { header: 'PO ID', field: 'poId' },
    { header: 'Product Details', field: 'productDetails' },
    { header: 'Order Value', field: 'orderValue' },
    { header: 'Discount %', field: 'discount' },
    { header: 'Final Approver', field: 'finalApprover' }
  ];

  searchFields: SearchFieldConfig[] = [
    {
      key: 'poId',
      label: 'PO ID',
      placeholder: 'Enter PO ID',
      type: 'text'
    },
    {
      key: 'productDetails',
      label: 'Product Details',
      placeholder: 'Enter Product Details',
      type: 'text'
    }
  ];

  rows: any[] = [];
  fullRows: any[] = [];

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {

    // Replace with actual API later
    const data = [
      {
        poId: 'PO1001',
        distributor: 'ABC Distributor',
        productDetails: 'Monitor Qty-2',
        orderValue: 250000,
        discount: '10%',
        finalApprover: 'Manager'
      },
      {
        poId: 'PO1002',
        distributor: 'XYZ Distributor',
        productDetails: 'ECG Qty-1',
        orderValue: 180000,
        discount: '5%',
        finalApprover: 'Director'
      }
    ];

    this.fullRows = data;

    this.rows = data.map((po: any, index: number) => ({
      sno: index + 1,
      distributor: po.distributor,
      poId: po.poId,
      productDetails: po.productDetails,
      orderValue: po.orderValue,
      discount: po.discount,
      finalApprover: po.finalApprover
    }));
  }

  onSearch(keyword: string): void {
    console.log('Search:', keyword);
  }

  onView(row: any): void {
    this.router.navigate([
      '/admin/purchase-order-approval/view',
      row.poId
    ]);
  }

  onEdit(row: any): void {
    this.router.navigate([
      '/admin/purchase-order-approval/edit',
      row.poId
    ]);
  }

  onReset(){}
}
