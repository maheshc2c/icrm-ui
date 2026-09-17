import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Pageheader } from '../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../models/breadcrumb';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-quote-revision',
  standalone: true,
  imports: [CommonModule, FormsModule, Pageheader, Sidebar, Header],
  templateUrl: './quote-revision.html'
})
export class QuoteRevisionComponent implements OnInit {
  private baseUrl = environment.baseUrl;
  quoteId: string = '';
  leadId: number | null = null;

  private getHomeRoute(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('role')?.trim();
      if (role) {
        const normalizedRole = role.replace(/[\s_]+/g, '').toUpperCase();
        switch (normalizedRole) {
          case 'SUPERADMIN':
            return '/superadmindashboard';
          case 'ADMIN':
            return '/admindashboard';
          case 'ADMINMARKETING':
            return '/adminmarketingdashboard';
          case 'SALESDIRECTOR':
            return '/sddashboard';
          case 'REGIONALBRANCHHEAD':
            return '/regional-branch-head-dashboard';
          case 'REGIONALSALESMANAGER':
            return '/regional-sales-manager-dashboard';
          case 'NATIONALSALESMANAGER':
            return '/national-sales-manager-dashboard';
          case 'GLOBALHEAD':
            return '/globalhead-dashboard';
          case 'COUNTRYHEAD':
            return '/country-head';
          case 'CUSTOMERINTERACTIONCENTER':
            return '/Approve-Leads';
          case 'OTR':
            return '/Cnotedownload';
          case 'SALESENGINEER':
          case 'SALESMANAGER':
          default:
            return '/sales-manager-dashboard';
        }
      }
    }
    return '/sales-manager-dashboard';
  }

  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: this.getHomeRoute() },
    { label: 'Quote Details' },
    { label: 'Quote Revision' }
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
    this.route.queryParamMap.subscribe(queryParams => {
      const qLeadId = queryParams.get('leadId');
      if (qLeadId && !isNaN(Number(qLeadId))) {
        this.leadId = Number(qLeadId);
        this.updateBreadcrumbs();
      }
    });

    this.route.paramMap.subscribe(params => {
      this.quoteId = params.get('id') || '1783402869854';
      this.updateBreadcrumbs();
      this.fetchQuoteDetails();
    });
  }

  updateBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: this.getHomeRoute() },
      ...(this.leadId ? [
        { label: 'Leads', route: '/openleads' },
        { label: `Lead #${this.leadId}`, route: `/salesmanager/leads/edit/${this.leadId}` }
      ] : [
        { label: 'Quote Details' }
      ]),
      { label: `Quote Revision (${this.quoteId})` }
    ];
  }

  fetchQuoteDetails() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    let quoteIdNum = 0;
    if (this.quoteId.includes('-')) {
      const parts = this.quoteId.split('-');
      if (parts.length >= 3 && !isNaN(Number(parts[2]))) {
        quoteIdNum = parseInt(parts[2], 10);
      } else {
        quoteIdNum = parseInt(this.quoteId.replace(/\D/g, '') || '0', 10);
      }
    } else {
      quoteIdNum = parseInt(this.quoteId, 10) || 0;
    }

    this.http.get(`${this.baseUrl}/quote/quote-revision-details/${quoteIdNum}`, { headers }).subscribe({
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
          if (data.leadId != null) {
            this.leadId = data.leadId;
            this.updateBreadcrumbs();
          }

          if (data.billingOptions) this.billingOptions = data.billingOptions;
          if (data.productOptions) this.productOptions = data.productOptions;
          if (data.dealerOptions) this.dealerOptions = data.dealerOptions;

          // Populate products list
          this.quotes = (data.opportunities || []).map((opp: any) => ({
            opportunityId: opp.opportunityId,
            productId: opp.productId,
            productName: opp.productName || 'Unknown Product',
            productNameWithIcon: opp.productName || 'Unknown Product',
            description: opp.description || '',
            editableQuantity: opp.quantity || 1,
            mrp: opp.mrp || 0,
            editableDiscount: opp.currentDiscount || 0,
            discountType: opp.discountType === 2 ? 'In %' : 'In Rs',
            discountedValue: opp.discountedValue || 0,
            selected: true,
            showFreeSupply: false,
            freeSupplyItems: []
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
    if (this.leadId) {
      this.router.navigate(['/salesmanager/leads/edit', this.leadId]);
    } else {
      window.history.back();
    }
  }

  errors: { [key: string]: string } = {};
  errorMessage: string = '';

  isSubmitting: boolean = false;

  validateForm(): boolean {
    this.errors = {};
    this.errorMessage = '';

    // 1. Must select at least one product
    if (!this.hasSelectedProduct()) {
      this.errorMessage = 'Please select at least one product for the quote revision.';
      return false;
    }

    // 2. Billing required
    if (!this.quoteForm.billingInfoId) {
      this.errors['billingInfoId'] = 'Please select Billing.';
    }

    // 3. Warranty required
    if (!this.quoteForm.warranty) {
      this.errors['warranty'] = 'Please select Warranty.';
    }

    // 4. Advance required and bounded
    if (this.quoteForm.advance == null || this.quoteForm.advance < 0) {
      this.errors['advance'] = 'Please enter a valid Advance amount.';
    } else if (this.quoteForm.advanceType === 1 && this.quoteForm.advance > 100) {
      this.errors['advance'] = 'Advance percentage cannot exceed 100%.';
    }

    // 5. Balance payment days required if not fully paid advance
    const totalQuoteValue = this.quotes
      .filter(q => q.selected)
      .reduce((sum, q) => sum + this.calculateDiscountedValue(q), 0);

    const isFullAdvance = (this.quoteForm.advanceType === 1 && this.quoteForm.advance === 100) ||
                          (this.quoteForm.advanceType === 2 && this.quoteForm.advance >= totalQuoteValue && totalQuoteValue > 0);

    if (!isFullAdvance) {
      if (!this.quoteForm.balancePaymentDays || this.quoteForm.balancePaymentDays < 1) {
        this.errors['balancePaymentDays'] = 'Please enter valid Balance Payment days (min 1).';
      }
    }

    // 6. Dealer Commission & Dealer selection rules (if not Distributor billing)
    if (this.quoteForm.billingInfoId !== 2) {
      if (this.quoteForm.dealerCommission == null || this.quoteForm.dealerCommission < 0 || this.quoteForm.dealerCommission > 100) {
        this.errors['dealerCommission'] = 'Please enter a valid Dealer Commission (0 - 100%).';
      }
      if (this.quoteForm.dealerCommission > 0 && !this.quoteForm.dealerId) {
        this.errors['dealerId'] = 'Please select a Dealer when commission is greater than 0%.';
      }
    }

    // 7. Validate product discounts
    for (const q of this.quotes.filter(p => p.selected)) {
      const discount = parseFloat(q.editableDiscount) || 0;
      const mrpTotal = (q.mrp || 0) * (q.editableQuantity || 1);

      if (discount < 0) {
        this.errorMessage = `Discount for ${q.productName} cannot be negative.`;
        return false;
      }
      if (q.discountType === 'In %' && discount > 100) {
        this.errorMessage = `Discount percentage for ${q.productName} cannot exceed 100%.`;
        return false;
      }
      if (q.discountType === 'In Rs' && discount > mrpTotal) {
        this.errorMessage = `Discount amount for ${q.productName} cannot exceed total MRP (${mrpTotal}).`;
        return false;
      }
    }

    if (Object.keys(this.errors).length > 0) {
      this.errorMessage = 'Please fix the highlighted errors below before submitting.';
      return false;
    }

    return true;
  }

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    // Calculate total product discount
    const totalProductDiscount = this.quotes
      .filter(q => q.selected)
      .reduce((sum, q) => sum + (parseFloat(q.editableDiscount) || 0), 0);

    let quoteIdNum = 0;
    if (this.quoteId && this.quoteId.includes('-')) {
      const parts = this.quoteId.split('-');
      if (parts.length >= 3 && !isNaN(Number(parts[2]))) {
        quoteIdNum = parseInt(parts[2], 10);
      } else {
        quoteIdNum = parseInt(this.quoteId.replace(/\D/g, '') || '0', 10);
      }
    } else {
      quoteIdNum = parseInt(this.quoteId, 10) || 0;
    }

    const payload = {
      quoteId: quoteIdNum,
      billingInfoId: this.quoteForm.billingInfoId,
      dealerId: this.quoteForm.dealerId,
      dealerCommission: this.quoteForm.dealerCommission,
      warranty: this.quoteForm.warranty,
      advanceType: this.quoteForm.advanceType,
      advance: this.quoteForm.advance,
      balancePaymentDays: this.quoteForm.balancePaymentDays,
      stockistId: this.quoteForm.stockistId,
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

    this.isSubmitting = true;

    this.http.post(`${this.baseUrl}/quote/create/quote-revision`, payload, { headers }).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res && res.status === false) {
          this.errorMessage = res.message || 'Failed to save quote revision.';
        } else {
          alert('Quote revision saved successfully!');
          this.goBack();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error saving quote revision:', err);
        const msg = err?.error?.message || err?.message || 'Failed to save quote revision';
        this.errorMessage = msg;
      }
    });
  }

}
