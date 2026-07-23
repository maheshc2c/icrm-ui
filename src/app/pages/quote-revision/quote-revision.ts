import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  quoteId: string = '1783402869854';
  leadId: number | null = null;
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

  quotes: any[] = [];
  billingOptions: any[] = [];
  productOptions: any[] = [];
  dealerOptions: any[] = [];
  warrantyOptions: number[] = Array.from({length: 17}, (_, i) => 12 + (i * 3)); // 12, 15, 18 ... 60

  hasSelectedProduct(): boolean {
    return this.quotes.some(q => q.selected);
  }

  quoteForm = {
    billingInfoId: 1,
    warranty: 12,
    advanceType: 1,
    advance: 0,
    dealerCommission: 10,
    dealerId: null as number | null,
    stockistId: null as number | null,
    discount: 0,
    balancePaymentDays: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.quoteId = params.get('id') || '1783402869854';
      this.breadcrumbs[2] = { label: `Quote ID - ${this.quoteId}` };
      this.fetchQuoteDetails();
    });
  }

  fetchQuoteDetails() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const quoteIdNum = parseInt(this.quoteId.replace(/\D/g, '') || '0');

    this.http.get(`http://localhost:8080/quote/quote-revision-details/${quoteIdNum}`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          const data = res.data;
          // Pre-populate form
          if (data.billingInfoId != null) this.quoteForm.billingInfoId = data.billingInfoId;
          if (data.warranty != null) this.quoteForm.warranty = data.warranty;
          if (data.advanceType != null) this.quoteForm.advanceType = data.advanceType;
          if (data.advance != null) this.quoteForm.advance = data.advance;
          if (data.dealerCommission != null) this.quoteForm.dealerCommission = data.dealerCommission;
          if (data.dealerId != null) this.quoteForm.dealerId = data.dealerId;
          if (data.stockistId != null) this.quoteForm.stockistId = data.stockistId;
          if (data.discount != null) this.quoteForm.discount = data.discount;
          if (data.balancePaymentDays != null) this.quoteForm.balancePaymentDays = data.balancePaymentDays;
          if (data.leadId != null) this.leadId = data.leadId;

          if (data.billingOptions) this.billingOptions = data.billingOptions;
          if (data.productOptions) this.productOptions = data.productOptions;
          if (data.dealerOptions) this.dealerOptions = data.dealerOptions;

          // Populate products list
          this.quotes = data.opportunities.map((opp: any) => ({
            opportunityId: opp.opportunityId,
            productId: opp.productId,
            productName: opp.productName || 'Unknown Product',
            description: opp.description || '',
            editableQuantity: opp.quantity || 1,
            mrp: opp.mrp || 0,
            editableDiscount: opp.currentDiscount || 0,
            discountType: opp.discountType === 2 ? 'In %' : 'In Rs',
            discountedValue: opp.discountedValue || 0,
            selected: true,
            showFreeSupply: false,
            freeSupplyItems: [
              { product: '', qty: '' }
            ]
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching quote details:', err);
      }
    });
  }

  calculateDiscountedValue(product: any): number {
    const qty = product.editableQuantity || 0;
    const mrp = product.mrp || 0;
    const baseTotal = qty * mrp;
    const discount = product.editableDiscount || 0;
    
    if (product.discountType === 'In %') {
      return baseTotal - (baseTotal * (discount / 100));
    } else {
      return Math.max(0, baseTotal - discount);
    }
  }

  addFreeSupplyItem(product: any) {
    product.freeSupplyItems.push({ product: '', qty: '' });
  }

  removeFreeSupplyItem(product: any, index: number) {
    product.freeSupplyItems.splice(index, 1);
  }

  onQuantityChange(event: {row: any, field: string, value: any}) {
    event.row[event.field] = event.value;
  }

  onDiscountChange(event: {row: any, field: string, value: any, discountType: string}) {
    event.row[event.field] = event.value;
    event.row.discountType = event.discountType;
  }

  goBack() {
    this.router.navigate(['/salesmanager/leads/edit', this.leadId || 5]);
  }

    onSubmit() {
    // 1. Calculate the total discount from all selected products in the table
    const totalProductDiscount = this.quotes
      .filter(q => q.selected)
      .reduce((sum, q) => sum + (parseFloat(q.editableDiscount) || 0), 0);

    const payload = {
      quoteId: this.quoteId ? parseInt(this.quoteId.replace(/\D/g, '') || '5') : 5,
      billingInfoId: this.quoteForm.billingInfoId,
      dealerId: this.quoteForm.dealerId,
      dealerCommission: this.quoteForm.dealerCommission,
      warranty: this.quoteForm.warranty,
      advanceType: this.quoteForm.advanceType,
      advance: this.quoteForm.advance,
      balancePaymentDays: this.quoteForm.balancePaymentDays,
      stockistId: this.quoteForm.stockistId,
      
      // 2. Map the calculated total sum here instead of the static form property
      discount: totalProductDiscount, 
      
      opportunities: this.quotes.filter(q => q.selected).map(q => ({
        opportunityId: q.opportunityId,
        discountType: q.discountType === 'In %' ? 2 : 1,
        discount: q.editableDiscount,
        freeSupplyItems: q.showFreeSupply ? q.freeSupplyItems.filter((fs: any) => fs.product).map((fs: any) => ({
          productId: fs.product, 
          quantity: parseInt(fs.qty || '0')
        })) : []
      }))
    };

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post('http://localhost:8080/quote/create/quote-revision', payload, { headers }).subscribe({
      next: (res) => {
        this.router.navigate(['/salesmanager/leads/edit', this.leadId || 17], { queryParams: { success: 'true' } });
      },
      error: (err) => {
        console.error('Error saving quote revision:', err);
        alert('Failed to save quote revision.');
      }
    });
  }

}
