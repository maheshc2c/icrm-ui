import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Pageheader } from "../../../shared/pageheader/pageheader";
import { DataTable } from '../../../shared/data-table/data-table';
import { ProductService } from '../../../service/productservice';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SearchFieldConfig } from '../../../shared/search/search';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Adminservice } from '../../../service/adminservice';
import { ConfirmDialogService } from '../../../service/confirm-dialog.service';
import { ToastService } from '../../../service/toast.service';
 
@Component({
  standalone: true,
  selector: 'app-product',
  imports: [
    CommonModule,
    Header,
    Sidebar,
    Pageheader,
    DataTable
  ],
  providers: [ProductService],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product implements OnInit {
  role: string | null = null;
 
  constructor(
    private productService: ProductService,
    private adminService: Adminservice,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmDialogService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
 
  headerTitle = 'Product List';
 
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Product', route: '/product' }
  ];
 
  columns = [
    { header: 'Product Code', field: 'productCode' },
    { header: 'Category', field: 'category' },
    { header: 'Segment', field: 'segment' },
    { header: 'Product', field: 'productName' },
    { header: 'Description', field: 'productDescription' },
    { header: 'Type', field: 'productType' },
    { header: 'MRP (Rs)', field: 'productMrp' },
    { header: 'Base Price (Rs)', field: 'productBasePrice' },
    { header: 'DP (Rs)', field: 'productDp' }
  ];
 
  rows: any[] = [];
  fullRows: any[] = []; // Master copy for search
 
  searchFields: SearchFieldConfig[] = [
    { key: 'productName', label: 'Product Name', type: 'text', placeholder: 'Search by Name' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'Search by Category' },
    { key: 'segment', label: 'Segment', type: 'text', placeholder: 'Search by Segment' }
  ];
 
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role');
    }
    this.loadProducts();
  }
 
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: any[]) => {
        console.log("API Response:", products);
 
        // Sort descending by productId to show newest first
        products.sort((a: any, b: any) => (b.productId || 0) - (a.productId || 0));
 
        this.fullRows = products;
        this.rows = products.map((c, index) => ({
          productId: c.productId ?? null,
          productCode: c.productSecondaryName || c.productCode || (c.productId ? 'PROD-' + String(c.productId).padStart(4, '0') : ''),
          category: c.group?.category?.categoryName ?? '',
          segment: c.group?.groupName ?? '',
          productName: c.productName ?? '',
          productDescription: c.productDescription ?? '',
          productType: typeof c.productType === 'object' ? c.productType?.typeName || c.productType?.name || 'Standard' : c.productType ?? 'Standard',
          productMrp: c.productMrp ?? 0,
          productBasePrice: c.productBasePrice ?? 0,
          productDp: c.productDp ?? 0,
          productStatus: c.productStatus 
        }));
      },
      error: (err: any) => {
        console.error("Failed to load product list:", err);
 
        if (err.status === 401) {
          this.toastService.error("Session expired, please login again.");
          this.router.navigate(['/login']);
        }
      }
    });
  }
 
  onSearch(searchData?: any): void {
    console.log('Search data received (Client-side):', searchData);

    let searchName = '';
    let searchCategory = '';
    let searchSegment = '';
    let searchType = '';

    if (typeof searchData === 'string') {
      searchName = searchData.toLowerCase().trim();
    } else if (searchData && typeof searchData === 'object') {
      searchName = (searchData.productName || '').toLowerCase().trim();
      searchCategory = (searchData.category || '').toLowerCase().trim();
      searchSegment = (searchData.segment || '').toLowerCase().trim();
      searchType = (searchData.productType || '').toLowerCase().trim();
    }

    if (!searchName && !searchCategory && !searchSegment && !searchType) {
      // 🔁 Restore full list from fullRows
      this.rows = this.fullRows.map((c) => ({
        productId: c.productId ?? null,
        productCode: c.productSecondaryName || c.productCode || (c.productId ? 'PROD-' + String(c.productId).padStart(4, '0') : ''),
        category: c.group?.category?.categoryName ?? '',
        segment: c.group?.groupName ?? '',
        productName: c.productName ?? '',
        productDescription: c.productDescription ?? '',
        productType: typeof c.productType === 'object' ? c.productType?.typeName || c.productType?.name || 'Standard' : c.productType ?? 'Standard',
        productMrp: c.productMrp ?? 0,
        productBasePrice: c.productBasePrice ?? 0,
        productDp: c.productDp ?? 0,
        productStatus: c.productStatus
      }));
      return;
    }

    // Filter fullRows locally
    const filtered = this.fullRows.filter(c => {
      const hasSecondaryName = !!c.productSecondaryName;
      const productName = (hasSecondaryName ? (c.productName ?? '') : (c.productDescription ?? c.productName ?? '')).toLowerCase();
      const category = (c.group?.category?.categoryName || '').toLowerCase();
      const segment = (c.group?.groupName || '').toLowerCase();
      const type = (typeof c.productType === 'object' ? c.productType?.typeName || c.productType?.name || '' : c.productType ?? '').toLowerCase();

      const matchesName = searchName ? productName.includes(searchName) : true;
      const matchesCategory = searchCategory ? category.includes(searchCategory) : true;
      const matchesSegment = searchSegment ? segment.includes(searchSegment) : true;
      const matchesType = searchType ? type.includes(searchType) : true;

      return matchesName && matchesCategory && matchesSegment && matchesType;
    });

    // Update table rows
    this.rows = filtered.map((c) => ({
      productId: c.productId ?? null,
      productCode: c.productSecondaryName || c.productCode || (c.productId ? 'PROD-' + String(c.productId).padStart(4, '0') : ''),
      category: c.group?.category?.categoryName ?? '',
      segment: c.group?.groupName ?? '',
      productName: c.productName ?? '',
      productDescription: c.productDescription ?? '',
      productType: typeof c.productType === 'object' ? c.productType?.typeName || c.productType?.name || 'Standard' : c.productType ?? 'Standard',
      productMrp: c.productMrp ?? 0,
      productBasePrice: c.productBasePrice ?? 0,
      productDp: c.productDp ?? 0,
      productStatus: c.productStatus
    }));
  }

  onImport(): void {
    if (!this.rows || this.rows.length === 0) {
      this.toastService.warning('No data available to download');
      return;
    }

    // Transform current table rows for Excel formatting
    const excelData = this.rows.map((row, index) => ({
      'S.NO': index + 1,
      'Category': row.category,
      'Segment': row.segment,
      'Product': row.productName,
      'Description': row.productDescription,
      'Type': row.productType,
      'MRP (Rs)': row.productMrp,
      'Base Price (Rs)': row.productBasePrice,
      'DP (Rs)': row.productDp
    }));

    // Generate worksheet and workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Products': worksheet },
      SheetNames: ['Products']
    };

    // Buffer the binary and trigger local download
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(data, `products_export_${new Date().getTime()}.xlsx`);
  }
 
  onAdd(): void {
    this.router.navigate(['/product/add']);
  }
 
  onEdit(row: any): void {
    console.log('Edit received in Product:', row);
    this.router.navigate(['/product/edit', row.productId]);
  }
 
  onDelete(row: any) {

  const id = row.productId;

  if (!id) {
    return;
  }

    const isActive = Number(row.productStatus) === 1;
  
    this.confirmService.confirm({
      title: 'Confirm',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this product?`,
      confirmText: isActive ? 'Deactivate' : 'Activate'
    }).then((confirmed) => {
      if (!confirmed) return;
  
      this.productService.activateDeactivateProduct(id).subscribe({
        next: () => {
          row.productStatus = isActive ? 2 : 1;
          this.rows = [...this.rows];
          this.fullRows = [...this.fullRows];
          this.toastService.success(`Product ${isActive ? 'deactivated' : 'activated'} successfully`);
        },
        error: err => {
          console.error('Status update failed', err);
          this.toastService.error('Failed to update status');
        }
      });
    });
  }
}
