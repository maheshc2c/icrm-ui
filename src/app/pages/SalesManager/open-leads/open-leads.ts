import { Component } from '@angular/core';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Search } from '../../../shared/search/search';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Breadcrumb } from '../../../models/breadcrumb';
import { Header } from '../../../layout/header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-open-leads',
  standalone: true,
  imports: [Pageheader, Search, Sidebar, Header, CommonModule],
  templateUrl: './open-leads.html',
  styleUrl: './open-leads.css',
})
export class OpenLeads {

  // ================= TAB STATE =================
  activeTab: 'lead' | 'opportunity' | 'quote' | 'contract' = 'lead';

  // ================= POPUP STATES =================
  showInfoPopup = false;
  showReroutePopup = false;
  showCustomerPopup = false;
  showInstallationPopup = false;
  oppdetails = false;
  showQuotePopup = false;

  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/superadmin' },
    { label: 'Company', route: '/superadmin/company' },
    { label: 'Add New' }
  ];

  // ================= TAB SWITCH =================
  switchTab(tab: 'lead' | 'opportunity' | 'quote' | 'contract') {
    this.activeTab = tab;
  }

  // ================= POPUP OPEN =================
  openInfo() {
    this.closeAll();
    this.showInfoPopup = true;
  }

   oppdetailsinfo() {
    this.closeAll();
    this.oppdetails = true;
  }

  quoteInfo() {
    this.closeAll();
    this.showQuotePopup = true;
  }

  openReroute() {
    this.closeAll();
    this.showReroutePopup = true;
  }

  openCustomer() {
    this.closeAll();
    this.showCustomerPopup = true;
  }

  openInstallation() {
    this.closeAll();
    this.showInstallationPopup = true;
  }

  // ================= POPUP CLOSE =================
  closeAll() {
    this.showInfoPopup = false;
    this.showReroutePopup = false;
    this.showCustomerPopup = false;
    this.showInstallationPopup = false;
    this.showQuotePopup = false;
    this.oppdetails = false;
  }


}
