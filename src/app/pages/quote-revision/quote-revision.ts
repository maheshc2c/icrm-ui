import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Pageheader } from '../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../models/breadcrumb';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';

@Component({
  selector: 'app-quote-revision',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader, Sidebar, Header],
  templateUrl: './quote-revision.html'
})
export class QuoteRevisionComponent implements OnInit {
  quoteId: string = '';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/' },
    { label: 'Quote Details' },
    { label: 'Quote ID - 5' }
  ];

  quoteColumns = [
    { header: 'Product Name', field: 'productNameWithIcon' },
    { header: 'Description', field: 'description' },
    { header: 'Quantity', field: 'editableQuantity' },
    { header: 'MRP', field: 'mrp' },
    { header: 'Discount', field: 'editableDiscount' },
    { header: 'Discounted Value', field: 'discountedValue' }
  ];

  quotes = [
    {
      productName: '101',
      description: 'Defense',
      editableQuantity: 1,
      mrp: 400,
      editableDiscount: 1.06,
      discountType: 'in %',
      discountedValue: 396
    }
  ];

  showFreeSupply: boolean = true;
  freeSupplyItems: any[] = [
    { product: '', qty: '' },
    { product: '', qty: '' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.quoteId = params.get('id') || 'KAR-26-S';
      this.breadcrumbs[2] = { label: `Quote ID - ${this.quoteId}` };
    });
  }

  onQuantityChange(event: {row: any, field: string, value: any}) {
    event.row[event.field] = event.value;
  }

  onDiscountChange(event: {row: any, field: string, value: any, discountType: string}) {
    event.row[event.field] = event.value;
    event.row.discountType = event.discountType;
  }

  goBack() {
    this.router.navigate(['/salesmanager/leads/edit', 5]);
  }

  addFreeSupplyItem() {
    this.freeSupplyItems.push({ product: '', qty: '' });
  }

  removeFreeSupplyItem(index: number) {
    this.freeSupplyItems.splice(index, 1);
  }

  onSubmit() {
    this.router.navigate(['/salesmanager/leads/edit', 17], { queryParams: { success: 'true' } });
  }
}
