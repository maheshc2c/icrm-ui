import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule,RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

menuItems: any[] = [];

constructor() {
  const role = localStorage.getItem('role');

//  this.menuItems = [
//     {
//       label: 'Home',
//       icon: 'fas fa-home',
//       route: '/dashboard'
//     }
//   ];

   if (role === 'SUPERADMIN') {
    this.menuItems.push(
       {
        label: 'Home',
        icon: 'fas fa-house',
        route: '/superadmindashboard'
      },
      {
        label: 'Manage Company',
        icon: 'fas fa-building',
        route: '/superadmin/company',
        // children: [
        //   { label: 'Admin Users', icon: 'fas fa-user', route: '/admin-users' },
        //   { label: 'Create User', icon: 'fas fa-user-plus', route: '/create-user' }
        // ]
      },
      {
        label: 'Manage AdminUser',
        icon: 'fas fa-user-shield',
        route: '/superadmin/superadmin-manage-users'
      },
    );
  }

   if (role === 'Admin') {
    this.menuItems.push(
       {
        label: 'Home',
        icon: 'fas fa-home',
        route: '/admindashboard'
      },
      {
        label: 'Manage User',
        // icon: 'fas fa-users',
        icon: 'fas fa-users-cog',
        route: '/users',
        // children: [
        //   { label: 'Admin Users', icon: 'fas fa-user', route: '/admin-users' },
        //   { label: 'Create User', icon: 'fas fa-user-plus', route: '/create-user' }
        // ]
      },
      {
        label: 'Manage Product',
        icon: 'fas fa-boxes-stacked',
        route: '/openleads',
        children: [
          { label: 'Category', icon: 'fas fa-tags', route: '/admin/category' },
          { label: 'Segment', icon: 'fas fa-layer-group', route: '/segment' },
          { label: 'Competitor', icon: 'fas fa-user-secret', route: '/competitor' },
          { label: 'Sub System', icon: 'fas fa-sitemap', route: '/sub-system' },
          { label: 'Product', icon: 'fas fa-box', route: '/product' },
          { label: 'Demo', icon: 'fas fa-flask', route: '/demoproduct' },
          { label: 'Financial Year', icon: 'fas fa-calendar-days', route: '/financial-yr' },
          { label: 'User Product Target', icon: 'fas fa-bullseye', route: '/user-target' },
        ]
      },
        {
        label: 'Manage Territory',
        icon: 'fas fa-map-location-dot',
        route: '/openleads',
        children: [
          { label: 'Geo', icon: 'fas fa-globe', route: '/geo' },
          { label: 'Country', icon: 'fas fa-flag', route: '/country' },
          { label: 'Region', icon: 'fas fa-map', route: '/region' },
          { label: 'State', icon: 'fas fa-map-marked-alt', route: '/state' },
          { label: 'District', icon: 'fas fa-location-dot', route: '/district' },
          { label: 'City/Town', icon: 'fas fa-city', route: '/city' }

        ]
      },
              {
        label: 'Manage Customer',
        icon: 'fas fa-user-group',
        route: '/openleads',
        children: [
          { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
          { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
          { label: 'Speciality', icon: 'fas fa-star', route: '/speciality' }
        ]
      },
            {
        label: 'So Number Entry',
        icon: 'fas fa-file-invoice',
        route: '/openleads',
        children: [
          { label: 'Open', icon: 'fas fa-folder-open', route: '/admin-users' },
          { label: 'Clouse', icon: 'fas fa-folder', route: '/create-user' }

        ]
      },
            {
        label: 'User Log',
        icon: 'fas fa-clock-rotate-left',
        route: '/admin/userlog'
      },
                {
        label: 'Inactive User Leads',
        icon: 'fas fa-user-slash',
        route: '/admindashboard'
      },
                    {
        label: 'Delete Contract Note',
        icon: 'fas fa-trash',
        route: '/admin/delete-contract-note'
      },
                  {
        label: 'Bulk Uploads',
        icon: 'fas fa-upload',
        route: '/openleads',
        children: [
          { label: 'Stock in Hand', icon: 'fas fa-box-open', route: '/admin-users' },
          { label: 'outstanding Amount', icon: 'fas fa-money-bill-wave', route: '/create-user' }

        ]
      },
                       {
        label: 'Settings',
        icon: 'fas fa-gear',
        route: '/openleads',
        children: [
          { label: 'General Settings', icon: 'fas fa-sliders', route: '/admin-users' },
          { label: 'Margin Bands', icon: 'fas fa-chart-line', route: '/create-user' },
          { label: 'incentivies Settings', icon: 'fas fa-coins', route: '/create-user' }

        ]
      },
                         {
        label: 'Chanel partners',
        icon: 'fas fa-handshake',
        route: '/admin/channelpartner'
      },
    );
  }

   if (role === 'ADMIN MARKETING') {
      this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/adminmarketingdashboard'
        },
        {
          label: 'Manage Campaign',
          icon: 'fas fa-calendar-alt',
          route: '/adminmarketing/compaign',
        },
        {
          label: 'Upload Documents',
          icon: 'fas fa-upload',
          route: '/adminmarketing/managedacument',
        },
        {
          label: 'Leads',
          icon: 'fas fa-user-tag',
          route: '/adminmarketingdashboard',
          children: [
            { label: 'Assign Leads', icon: 'fas fa-user-plus', route: '/adminmarketing/assing-leads' },
            { label: 'Track Leads', icon: 'fas fa-chart-line', route: '/adminmarketing/track-leads' },
          ]
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-users-cog',
          route: '/adminmarketingdashboard',
          children: [
            { label: 'Customer', icon: 'fas fa-user-friends', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
            { label: 'Speciality', icon: 'fas fa-star', route: '/speciality' }
          ]
        }
      );
    }

     if (role === 'Regional Branch Head') {
      this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/regional-branch-head-dashboard'
        },
        {
          label: 'Dashboards',
          icon: 'fas fa-tachometer-alt',
          route: '/regional-branch-head-dashboard',
          children: [
            { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: '/regional-branch-head/leads-dashboard' },
            { label: 'Opportunity Dashboard', icon: 'fas fa-regional-branch-head/opportunity-dashboard' }
          ]
        },
        {
          label: 'Reports',
          icon: 'fas fa-chart-bar',
          route: '/regional-branch-head-dashboard',
          children: [
            { label: 'Funnel Report', icon: 'fas fa-chart-line', route: '/dashboard' },
            { label: 'Margin Analysis', icon: 'fas fa-chart-pie', route: '/regional-branch-head/margin-analysis' },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-pie', route: '/regional-branch-head/reports/margin-analysis-c-note' },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/regional-branch-head/opportunity-lost' },
            { label: 'Open Orders', icon: 'fas fa-box-open', route: '/regional-branch-head/open-order-reports' },
            { label: 'Stock In Hand', icon: 'fas fa-warehouse', route: '/regional-branch-head/stock-in-hand-report' },
            { label: 'Fresh Business', icon: 'fas fa-briefcase', route: '/regional-branch-head/fresh-business' },
            { label: 'Target Vs Sales', icon: 'fas fa-bullseye', route: '/regional-branch-head/target-sales-report' },
            { label: 'Runrate Projection', icon: 'fas fa-chart-area', route: '/regional-branch-head/runrate-projection' },
            { label: 'Incentives', icon: 'fas fa-money-bill-wave', route: '/regional-branch-head/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-file-invoice-dollar', route: '/regional-branch-head/outstanding-report' },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/regional-branch-head/view-calendar'
        },
        {
          label: 'Commission',
          icon: 'fas fa-money-bill-wave',
          route: '/regional-branch-head/commission'
        },
        {
          label: 'Leads',
          icon: 'fas fa-users',
          route: '/regional-branch-head/approve-leads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/regional-branch-head/approve-leads' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/regional-branch-head/approve-leads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/regional-branch-head/approve-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-briefcase',
          route: '/regional-branch-head/so-number-entry/open',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/regional-branch-head/so-number-entry/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/regional-branch-head/so-number-entry/closed' },
            { label: 'Funnel History', icon: 'fas fa-history', route: '/regional-branch-head/dashboard' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar-check',
          route: '/regional-branch-head/plan-a-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-route', route: '/regional-branch-head/plan-a-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
        {
          label: 'Approvals',
          icon: 'fas fa-check-circle',
          route: '/regional-branch-head/quote-approval',
          children: [
            { label: 'C-Note Approval', icon: 'fas fa-file-signature', route: '/c-note' },
            { label: 'Quote Approval', icon: 'fas fa-file-signature', route: '/quotes-view' },
            { label: 'Purchase Order Approval', icon: 'fas fa-file-contract', route: '/PO-Approval' }
          ]
        },
        {
          label: 'Demo Products',
          icon: 'fas fa-box-open',
          route: '/regional-branch-head/demo-product'
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-user-cog',
          route: '/country-head/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-file-upload',
          route: '/regional-branch-head/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-search',
          route: '/regional-branch-head/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar-day', route: '/regional-branch-head/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar-week', route: '/regional-branch-head/track-purchase-order' }
          ]
        },
        {
          label: 'Dealer opening stock',
          icon: 'fas fa-box-open',
          route: '/regional-branch-head/dealer-opening-stock'
        }
      );
    }

    if (role === 'Regional Sales Manager') {
      this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/regional-sales-manager-dashboard'
        },
        {
          label: 'Dashboards',
          icon: 'fas fa-tachometer-alt',
          route: '/regional-sales-manager-dashboard',
          children: [
            { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: '/regional-sales-manager-dashboard/leads-dashboard' },
            { label: 'Opportunity Dashboard', icon: 'fas fa-country-head/opportunity-dashboard' }
          ]
        },
        {
          label: 'Reports',
          icon: 'fas fa-chart-bar',
          route: '/regional-sales-manager-dashboard',
          children: [
            { label: 'Funnel Report', icon: 'fas fa-chart-line', route: '/regional-sales-manager-dashboard/funnel-report' },
            { label: 'Margin Analysis', icon: 'fas fa-chart-pie', route: '/regional-sales-manager-dashboard/margin-analysis' },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-pie', route: '/regional-sales-manager-dashboard/reports/margin-analysis-c-note' },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/regional-sales-manager-dashboard/opportunity-lost' },
            { label: 'Open Orders', icon: 'fas fa-box-open', route: '/regional-sales-manager-dashboard/open-order-reports' },
            { label: 'Stock In Hand', icon: 'fas fa-warehouse', route: '/regional-sales-manager-dashboard/stock-in-hand-report' },
            { label: 'Fresh Business', icon: 'fas fa-briefcase', route: '/regional-sales-manager-dashboard/fresh-business' },
            { label: 'Target Vs Sales', icon: 'fas fa-bullseye', route: '/regional-sales-manager-dashboard/target-sales-report' },
            { label: 'Runrate Projection', icon: 'fas fa-chart-area', route: '/regional-sales-manager-dashboard/runrate-projection' },
            { label: 'Incentives', icon: 'fas fa-money-bill-wave', route: '/regional-sales-manager-dashboard/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-file-invoice-dollar', route: '/country-head/outstanding-report' },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/regional-sales-manager-view-calendar'
        },
        {
          label: 'Leads',
          icon: 'fas fa-users',
          route: '/customer-interaction-center/approve-leads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/customer-interaction-center/approve-leads' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/customer-interaction-center/approve-leads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/customer-interaction-center/approve-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-briefcase',
          route: '/regional-sales-manager-dashboard/so-number-entry/open',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/country-head/so-number-entry/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/country-head/so-number-entry/closed' },
            { label: 'Funnel History', icon: 'fas fa-history', route: '/regional-sales-manager-dashboard/funnel-history' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar-check',
          route: '/regional-sales-manager/plan-a-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-route', route: '/regional-sales-manager-dashboard/plan-a-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
 
        {
          label: 'Manage Customer',
          icon: 'fas fa-user-cog',
          route: '/regional-sales-manager-dashboard/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-file-upload',
          route: '/regional-sales-manager-dashboard/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-search',
          route: '/regional-sales-manager-dashboard/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar-day', route: '/regional-sales-manager-dashboard/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar-week', route: '/regional-sales-manager-dashboard/track-purchase-order' }
          ]
        }
      );
    }

    if (role === 'Country Head') {
      this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/country-head'
        },
        {
          label: 'Dashboards',
          icon: 'fas fa-tachometer-alt',
          route: '/country-head',
          children: [
            { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: '/country-head/dashboard/leads-dashboard' },
            { label: 'Opportunity Dashboard', icon: 'fas fa-chart-bar', route: '/country-head/dashboard/opportunity-dashboard' }
          ]
        },
        {
          label: 'Reports',
          icon: 'fas fa-chart-bar',
          route: '/country-head/dashboard',
          children: [
            { label: 'Funnel Report', icon: 'fas fa-chart-line', route: '/country-head/dashboard/funnel-report' },
            { label: 'Margin Analysis', icon: 'fas fa-chart-pie', route: '/country-head/dashboard/margin-analysis' },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-pie', route: '/country-head/dashboard/reports/margin-analysis-c-note' },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/country-head/dashboard/opportunity-lost' },
            { label: 'Open Orders', icon: 'fas fa-box-open', route: '/country-head/dashboard/open-order-reports' },
            { label: 'Stock In Hand', icon: 'fas fa-warehouse', route: '/country-head/dashboard/stock-in-hand-report' },
            { label: 'Fresh Business', icon: 'fas fa-briefcase', route: '/country-head/dashboard/fresh-business' },
            { label: 'Target Vs Sales', icon: 'fas fa-bullseye', route: '/country-head/dashboard/target-sales-report' },
            { label: 'Runrate Projection', icon: 'fas fa-chart-area', route: '/country-head/dashboard/runrate-projection' },
            { label: 'Incentives', icon: 'fas fa-money-bill-wave', route: '/country-head/dashboard/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-file-invoice-dollar', route: '/country-head/dashboard/outstanding-report' },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/country-head/dashboard/view-calendar'
        },
        {
          label: 'Leads',
          icon: 'fas fa-users',
          route: '/countryhead/leads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/countryhead/leads/new' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/countryhead/leads/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/countryhead/leads/closed' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-briefcase',
          route: '/country-head/dashboard/opportunity',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/country-head/dashboard/opportunity/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/country-head/dashboard/opportunity/closed' },
            { label: 'Funnel History', icon: 'fas fa-history', route: '/country-head/dashboard/funnel-history' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar-check',
          route: '/country-head/dashboard/plan-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-route', route: '/country-head/dashboard/plan-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
        {
          label: 'Approvals',
          icon: 'fas fa-check-circle',
          route: '/country-head/dashboard/approvals',
          children: [
            { label: 'Quote Approval', icon: 'fas fa-file-signature', route: '/quotes-view' },
            { label: 'Purchase Order Approval', icon: 'fas fa-file-contract', route: '/country-head/dashboard/purchase-order-approval' }
          ]
        },
        {
          label: 'Demo Products',
          icon: 'fas fa-box-open',
          route: '/country-head/dashboard/demo-product'
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-user-cog',
          route: '/country-head/dashboard/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-file-upload',
          route: '/country-head/dashboard/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-search',
          route: '/country-head/dashboard/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar-day', route: '/country-head/dashboard/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar-week', route: '/country-head/dashboard/track-purchase-order' }
          ]
        }
      );
    }


    if (role === 'Global Head') {
      this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/globalhead-dashboard'
        },
        {
          label: 'Dashboards',
          icon: 'fas fa-tachometer-alt',
          route: '/globalhead-dashboard',
          children: [
            { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: '/globalhead-dashboard/leads-dashboard' },
            { label: 'Opportunity Dashboard', icon: 'fas fa-chart-bar', route: '/globalhead-dashboard/opportunity-dashboard' }
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/globalhead-dashboard/view-calendar'
        },
        {
          label: 'Leads',
          icon: 'fas fa-users',
          route: '/globalhead-dashboard/leads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/globalhead-dashboard/leads/new' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/globalhead-dashboard/leads/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/globalhead-dashboard/leads/closed' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-briefcase',
          route: '/globalhead-dashboard/opportunity',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/globalhead-dashboard/opportunity/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/globalhead-dashboard/opportunity/closed' },
            { label: 'Funnel History', icon: 'fas fa-history', route: '/globalhead-dashboard/funnel-history' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar-check',
          route: '/plan-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-route', route: '/plan-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-user-cog',
          route: '/globalhead-dashboard/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-file-upload',
          route: '/globalhead-dashboard/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-search',
          route: '/globalhead-dashboard/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar-day', route: '/globalhead-dashboard/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar-week', route: '/globalhead-dashboard/track-purchase-order' }
          ]
        },
      );
    }
  


    if (role === 'National Sales Manager') {
        this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/national-sales-manager-dashboard',
        },
        {
          label: 'Dashboards',
          icon: 'fas fa-tachometer-alt',
          route: '/national-sales-manager-dashboard',
          children: [
            { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: `/leads-dashboard` },
            { label: 'Opportunity Dashboard', icon: 'fas fa-chart-bar', route: `/opportunity-dashboard` }
          ]
        },
        {
          label: 'Reports',
          icon: 'fas fa-chart-bar',
          route: '/adminmarketingdashboard',
          children: [
            { label: 'Funnel Report', icon: 'fas fa-chart-line', route: `/funnel-report` },
            { label: 'Margin Analysis', icon: 'fas fa-chart-pie', route: `/margin-analysis` },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-pie', route: `/reports/margin-analysis-c-note` },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: `/opportunity-lost` },
            { label: 'Open Orders', icon: 'fas fa-box-open', route: `/open-order-reports` },
            { label: 'Stock In Hand', icon: 'fas fa-warehouse', route: `/stock-in-hand-report` },
            { label: 'Fresh Business', icon: 'fas fa-briefcase', route: `/fresh-business` },
            { label: 'Target Vs Sales', icon: 'fas fa-bullseye', route: `/target-sales-report` },
            { label: 'Runrate Projection', icon: 'fas fa-chart-area', route: `/runrate-projection` },
            { label: 'Incentives', icon: 'fas fa-money-bill-wave', route: `/incentives` },
            { label: 'Outstanding Report', icon: 'fas fa-file-invoice-dollar', route: `/outstanding-report` },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: `/view-calendar`
        },
        {
          label: 'Leads',
          icon: 'fas fa-users',
          route: '/countryhead/leads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/countryhead/leads/new' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/countryhead/leads/open' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/countryhead/leads/closed' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-briefcase',
          route: `/opportunity`,
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: `/opportunity/open` },
            { label: 'Closed', icon: 'fas fa-folder', route: `/opportunity/closed` },
            { label: 'Funnel History', icon: 'fas fa-history', route: `/funnel-history` }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar-check',
          route: `/plan-visit`,
          children: [
            { label: 'Visit', icon: 'fas fa-route', route: `/plan-visit` },
            { label: 'Demo', icon: 'fas fa-suitcase', route: `/planDemo` }
          ]
        },
        {
          label: 'Approvals',
          icon: 'fas fa-check-circle',
          route: `/approvals`,
          children: [
            { label: 'CNote Approval', icon: 'fas fa-file-signature', route: `/c-note` },
            { label: 'Quote Approval', icon: 'fas fa-file-signature', route: `/quotes-view` },
            { label: 'Purchase Order Approval', icon: 'fas fa-file-contract', route: `/purchase-order-approval` }
          ]
        },
        {
          label: 'Demo Products',
          icon: 'fas fa-box-open',
          route: `/demo-product`
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-user-cog',
          route: `/manage-customer`,
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: `/customer` },
            { label: 'Contact', icon: 'fas fa-address-book', route: `/contact` },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-file-upload',
          route: `/marketing-document`
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-search',
          route: `/track-quotes`,
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar-day', route: `/track-quotes` },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar-week', route: `/track-purchase-order` }
          ]
        }
      );
    }

     if (role === 'Customer Interaction Center') {
    this.menuItems.push(
       {
        label: 'Approve Leads',
        icon: 'fas fa-house',
        route: '/Approve-Leads'
      },
      {
        label: 'So Number Entry',
        icon: 'fa  fa-pencil',
        route: '/Approve-Leads',
        children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: `/SO-Number-Open` },
            { label: 'Close', icon: 'fas fa-folder', route: `/SO-Number-close` }
          ]
      },
    );
  }


  if (role === 'Sales Engineer' || role === 'SALES_MANAGER' || role === 'SALESMANAGER' || role === 'Sales Manager') {
    this.menuItems.push(
      {
        label: 'Home',
        icon: 'fas fa-home',
        route: '/sales-manager-dashboard'
      },
      {
        label: 'Dashboards',
        icon: 'fas fa-tachometer-alt',
        route: '/dashboards',
        children: [
          { label: 'Leads Dashboard', icon: 'fas fa-chart-line', route: '/dashboards/leads' },
          { label: 'Opportunity Dashboard', icon: 'fas fa-chart-pie', route: '/dashboards/opportunity' }
        ]
      },
      {
        label: 'Reports',
        icon: 'fas fa-file-alt',
        route: '/reports',
        children: [
          { label: 'Funnel Report', icon: 'fas fa-filter', route: '/reports/funnel' },
          { label: 'Opportunity List', icon: 'fas fa-list', route: '/reports/opportunity-list' },
          { label: 'Open Orders', icon: 'fas fa-folder-open', route: '/reports/open-orders' },
          { label: 'Stock In Hand', icon: 'fas fa-boxes', route: '/reports/stock-in-hand' },
          { label: 'Fresh Business report', icon: 'fas fa-chart-line', route: '/reports/fresh-business' },
          { label: 'Target Vs Sales', icon: 'fas fa-bullseye', route: '/reports/target-vs-sales' },
          { label: 'Runrate Projection', icon: 'fas fa-chart-area', route: '/reports/runrate-projection' },
          { label: 'Incentives report', icon: 'fas fa-gift', route: '/reports/incentives' }
        ]
      },
      {
        label: 'Calendar',
        icon: 'fas fa-calendar-alt',
        route: '/calendar'
      },
      {
        label: 'Leads',
        icon: 'fas fa-inbox',
        route: '/leads',
        children: [
          { label: 'New', icon: 'fas fa-plus-circle', route: '/salesmanager/leads/add' },
          { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
          { label: 'Closed', icon: 'fas fa-check-circle', route: '/salesmanager/closed-leads' }
        ]
      },
      {
        label: 'Opportunity',
        icon: 'fas fa-lightbulb',
        route: '/opportunity',
        children: [
          { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
          { label: 'Closed', icon: 'fas fa-check-circle', route: '/salesmanager/closed-opportunities' },
          { label: 'Funnel History', icon: 'fas fa-history', route: '/salesmanager/funnel-history' }
        ]
      },
      {
        label: 'Plan Visit/ Demo',
        icon: 'fas fa-map-marked-alt',
        route: '/plan-visit-demo',
        children: [
          { label: 'Plan a Visit', icon: 'fas fa-walking', route: '/salesmanager/visit' },
          { label: 'Plan a Demo', icon: 'fas fa-laptop', route: '/planDemo' }
        ]
      },
      {
        label: 'Manage Customer',
        icon: 'fas fa-users',
        route: '/manage-customer',
        children: [
          { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
          { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' }
        ]
      },
      {
        label: 'Marketing Documents',
        icon: 'fas fa-file-pdf',
        route: '/salesmanager/marketing-documents'
      },
      {
        label: 'Track Quote/PO',
        icon: 'fas fa-clipboard-list',
        route: '/track-quote-po',
        children: [
          { label: 'Track Quotes', icon: 'fas fa-file-invoice', route: '/salesmanager/track-quotes' },
          { label: 'Track Purchase Orders', icon: 'fas fa-shopping-cart', route: '/salesmanager/track-po' }
        ]
      }
    );
  }



  if (role === 'Sales Director') {
  this.menuItems.push(
    {
      label: 'Home',
      icon: 'fas fa-home',
      route: '/sddashboard'
    },
    {
      label: 'Dashboards',
      icon: 'fas fa-chart-pie',
      route: '/salesdirector/leads',
      children: [
          { label: 'Leads Dashboard', icon: 'fas fa-chart-line', route: '/' },
          { label: 'Oppurtunity Dashboard', icon: 'fas fa-lightbulb', route: '/' },

        ]
    },
    {
      label: 'Reports',
      icon: 'fas fa-chart-column',
      route: '/salesdirector/opportunities',
      children: [
          { label: 'Funnel Report', icon: 'fas fa-filter', route: '/' },
          { label: 'Oppurtunity Lost', icon: 'fas fa-face-frown', route: '/' },
          { label: 'Open Orders', icon: 'fas fa-box-open', route: '/' },
          { label: 'Stock In Hand', icon: 'fas fa-warehouse', route: '/' },
          { label: 'Fresh Business Report', icon: 'fas fa-seedling', route: '/' },
          { label: 'Target Vs Sales', icon: 'fas fa-bullseye', route: '/' },
          { label: 'Runrate Projection', icon: 'fas fa-gauge-high', route: '/' },
          { label: 'Incentives report', icon: 'fas fa-coins', route: '/' },
        ]
    },
    {
      label: 'Calendar',
      icon: 'fas fa-calendar',
      route: '/salesdirector/calendar'
    },
    {
      label: 'Leads',
      icon: 'fas fa-user-plus',
      route: '/salesdirector/report',
        children: [
          { label: 'New', icon: 'fas fa-circle-plus', route: '/' },
          { label: 'Open', icon: 'fas fa-folder-open', route: '/' },
          { label: 'Closed', icon: 'fas fa-circle-check', route: '/' },
        ]
    },
    {
      label: 'Oppurtunity',
      icon: 'fas fa-lightbulb',
      route: '/salesdirector/report',
        children: [
          { label: 'New', icon: 'fas fa-circle-plus', route: '/' },
          { label: 'Open', icon: 'fas fa-folder-open', route: '/' },
          { label: 'Closed', icon: 'fas fa-circle-check', route: '/' },
        ]
    },
    {
      label: 'Plan Visit/ Demo',
      icon: 'fas fa-route',
      route: '/salesdirector/report',
        children: [
          { label: 'Plan a Visit', icon: 'fas fa-map-location-dot', route: '/salesdirector/planVisit' },
          { label: 'Plan a Demo', icon: 'fas fa-display', route: '/planDemo' },
        ]
    },
    {
      label: 'Manage Customer',
      icon: 'fas fa-users',
      route: '/salesdirector/report',
        children: [
          { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
          { label: 'Contact', icon: 'fas fa-address-book', route: '/contact' },
        ]
    },{
      label: 'Marketing Documents',
      icon: 'fas fa-file-lines',
      route: '/salesdirector/viewCampaignDocuments',
    },
    {
      label: 'Track Qoute/PO',
      icon: 'fas fa-file-invoice-dollar',
      route: '/salesdirector/report',
        children: [
          { label: 'Track Qoutes', icon: 'fas fa-file-signature', route: '/salesdirector/track-quotes' },
          { label: 'Track Purchase Orders', icon: 'fas fa-file-invoice', route: '/salesdirector/track-po' },
        ]
    },
  );
}



   if (role === 'OTR') {
    this.menuItems.push(
       {
        label: 'Home',
        icon: 'fas fa-house',
        route: '/'
      },
      {
        label: 'C-note Download',
        icon: 'fas fa-building',
        route: '/Cnotedownload',
        // children: [
        //   { label: 'Admin Users', icon: 'fas fa-user', route: '/admin-users' },
        //   { label: 'Create User', icon: 'fas fa-user-plus', route: '/create-user' }
        // ]
      },
      {
        label: 'Commision',
        icon: 'fas fa-user-shield',
        route: '/comission'
      },
    );
  }

}}

