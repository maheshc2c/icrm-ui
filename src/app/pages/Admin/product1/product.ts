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
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
 
  headerTitle = 'Product List';
 
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Product', route: '/admin/product' }
  ];
 
  columns = [
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
 
  searchFields: SearchFieldConfig[] = [
    { key: 'productName', label: 'Product Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'segment', label: 'Segment', type: 'text' },
    {
      key: 'productType',
      label: 'Type',
      type: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
      ]
    }
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
 
        this.rows = products.map((c, index) => ({
          productId: c.productId ?? null,
          category: c.group?.category?.categoryName ?? '',
          segment: c.group?.groupName ?? '',
          productName: c.productName ?? '',
          productDescription: c.productDescription ?? '',
          productType: typeof c.productType === 'object' ? c.productType?.typeName || c.productType?.name || 'Standard' : c.productType ?? 'Standard',
          productMrp: c.productMrp ?? 0,
          productBasePrice: c.productBasePrice ?? 0,
          productDp: c.productDp ?? 0
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
 
  onSearch(): void {
    console.log("Search Clicked");
  }
 
  onImport(): void {
    console.log("Import Clicked");
  }
 
  onAdd(): void {
    this.router.navigate(['/admin/add-product']);
  }
 
  onEdit(row: any): void {
    console.log('Edit received in Product:', row);
    this.router.navigate(['/admin/product/edit', row.productId]);
  }
 
  onDelete(row: any): void {
    console.log('Delete', row);
  }
}