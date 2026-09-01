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

   if (role === 'SUPERADMIN' || role === 'SUPER ADMIN' || role === 'Super Admin' || role === 'SuperAdmin') {
    this.menuItems.push(
       {
        label: 'Home',
        icon: 'fas fa-home',
        route: '/superadmindashboard'
      },
      {
        label: 'Manage AdminUser',
        icon: 'fas fa-user',
        route: '/superadmin/manage-users'
      },
      {
        label: 'Manage Companies',
        icon: 'fas fa-building',
        route: '/superadmin/company',
      },
    );
  }

   if (role === 'Admin' || role === 'ADMIN') {
    this.menuItems.push(
       {
        label: 'Home',
        icon: 'fas fa-home',
        route: '/admindashboard'
      },
      {
        label: 'Manage User',
        icon: 'fas fa-users',
        route: '/users',
      },
      {
        label: 'Manage Product',
        icon: 'fas fa-book',
        route: '/openleads',
        children: [
          { label: 'Category', icon: 'fab fa-dropbox', route: '/admin/category' },
          { label: 'Segment', icon: 'fas fa-qrcode', route: '/segment' },
          { label: 'Competitor', icon: 'fas fa-thumbs-up', route: '/competitor' },
          { label: 'Sub System', icon: 'fas fa-crosshairs', route: '/sub-system' },
          { label: 'Product', icon: 'fas fa-list-alt', route: '/product' },
          { label: 'Demo', icon: 'fas fa-suitcase', route: '/demoproduct' },
          { label: 'Financial Year', icon: 'fab fa-dropbox', route: '/financial-yr' },
          { label: 'User Product Target', icon: 'fas fa-list-ol', route: '/user-target' },
        ]
      },
        {
        label: 'Manage Territory',
        icon: 'fas fa-hospital',
        route: '/openleads',
        children: [
          { label: 'Geo', icon: 'fas fa-globe', route: '/geo' },
          { label: 'Country', icon: 'fas fa-plane', route: '/country' },
          { label: 'Region', icon: 'fas fa-map-marker-alt', route: '/region' },
          { label: 'State', icon: 'fas fa-truck', route: '/state' },
          { label: 'District', icon: 'fas fa-road', route: '/district' },
          { label: 'City/Town', icon: 'fas fa-thumbtack', route: '/city' }

        ]
      },
              {
        label: 'Manage Customer',
        icon: 'fas fa-users',
        route: '/openleads',
        children: [
          { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
          { label: 'Contact', icon: 'fas fa-book', route: '/contact' },
          { label: 'Speciality', icon: 'fas fa-star', route: '/speciality' }
        ]
      },
            {
        label: 'So Number Entry',
        icon: 'fas fa-pencil',
        route: '/openleads',
        children: [
          { label: 'Open', icon: 'fas fa-folder-open', route: '/admin-users' },
          { label: 'Clouse', icon: 'fas fa-folder', route: '/create-user' }

        ]
      },
            {
        label: 'User Log',
        icon: 'fas fa-cloud-download',
        route: '/admin/userlog'
      },
                {
        label: 'Inactive User Leads',
        icon: 'fas fa-exclamation-triangle',
        route: '/admin/inactive-user-leads'
      },
                    {
        label: 'Delete Contract Note',
        icon: 'fas fa-trash',
        route: '/admin/delete-contract-note'
      },
                  {
        label: 'Bulk Uploads',
        icon: 'fas fa-cloud-upload',
        route: '/openleads',
        children: [
          { label: 'Stock in Hand', icon: 'fas fa-tasks', route: '/admin-users' },
          { label: 'outstanding Amount', icon: 'fas fa-money-bill', route: '/create-user' }

        ]
      },
                       {
        label: 'Settings',
        icon: 'fas fa-cogs',
        route: '/openleads',
        children: [
          { label: 'General Settings', icon: 'fas fa-cogs', route: '/admin/general-settings' },
          { label: 'Margin Bands', icon: 'fas fa-thumbs-up', route: '/admin/margin-bands' },
          { label: 'Incentivies Settings', icon: 'fas fa-cog', route: '/admin/incentives-settings' }

        ]
      },
                         {
        label: 'Chanel partners',
        icon: 'fas fa-puzzle-piece',
        route: '/admin/channelpartner'
      },
    );
  }

    if (role === 'ADMIN MARKETING' || role === 'ADMINMARKETING' || role === 'ADMIN_MARKETING' || role === 'Admin Marketing') {
      this.menuItems.push(
        {
          label: 'Home',
          icon: 'fas fa-home',
          route: '/adminmarketingdashboard'
        },
        {
          label: 'Manage Campaign',
          icon: 'fas fa-building',
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
            { label: 'Assign Leads', icon: 'fas fa-check-square', route: '/adminmarketing/assing-leads' },
            { label: 'Track Leads', icon: 'fas fa-calendar', route: '/adminmarketing/track-leads' },
          ]
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-users',
          route: '/adminmarketingdashboard',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/adminmarketing/customer' },
            { label: 'Contact', icon: 'fas fa-book', route: '/adminmarketing/contact' },
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
            { label: 'Opportunity Dashboard', icon: 'fas fa-chart-bar', route: '/regional-branch-head/opportunity-dashboard' }
          ]
        },
        {
          label: 'Reports',
          icon: 'fas fa-chart-bar',
          route: '/regional-branch-head-dashboard',
          children: [
            { label: 'Funnel Report', icon: 'fas fa-chart-bar', route: '/reports/funnel' },
            { label: 'Margin Analysis', icon: 'fas fa-chart-bar', route: '/reports/margin-analysis' },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-bar', route: '/reports/margin-analysis-c-note' },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/reports/opportunity-lost' },
            { label: 'Open Orders', icon: 'fas fa-chart-bar', route: '/reports/OpenOrders' },
            { label: 'Stock In Hand', icon: 'fas fa-chart-bar', route: '/reports/stock-in-hand' },
            { label: 'Fresh Business', icon: 'fas fa-chart-bar', route: '/reports/fresh-business' },
            { label: 'Target Vs Sales', icon: 'fas fa-chart-bar', route: '/reports/target-vs-sales' },
            { label: 'Runrate Projection', icon: 'fas fa-chart-bar', route: '/reports/runrate-projection' },
            { label: 'Incentives', icon: 'fas fa-chart-bar', route: '/reports/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-chart-bar', route: '/reports/outstanding' },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/regional-branch-head/view-calendar'
        },
        {
          label: 'Commission',
          icon: 'fas fa-money-bill',
          route: '/regional-branch-head/commission'
        },
        {
          label: 'Leads',
          icon: 'fas fa-user-md',
          route: '/openleads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-edit',
          route: '/salesmanager/opportunities',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
            { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar',
          route: '/regional-branch-head/plan-a-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-tachometer-alt', route: '/regional-branch-head/plan-a-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
        {
          label: 'Approvals',
          icon: 'fas fa-thumbs-up',
          route: '/regional-branch-head/quote-approval',
          children: [
            { label: 'C-Note Approval', icon: 'fas fa-thumbs-up', route: '/c-note' },
            { label: 'Quote Approval', icon: 'fas fa-thumbs-up', route: '/quotes-view' },
            { label: 'Purchase Order Approval', icon: 'fas fa-thumbs-up', route: '/PO-Approval' }
          ]
        },
        {
          label: 'Demo Products',
          icon: 'fas fa-lightbulb',
          route: '/regional-branch-head/demo-product'
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-users',
          route: '/country-head/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-copy',
          route: '/regional-branch-head/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-calendar',
          route: '/regional-branch-head/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar', route: '/regional-branch-head/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: '/regional-branch-head/track-purchase-order' }
          ]
        },
        {
          label: 'Dealer opening stock',
          icon: 'fas fa-pencil',
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
            { label: 'Opportunity Dashboard', icon: 'fas fa-chart-bar', route: '/country-head/opportunity-dashboard' }
          ]
        },
        {
          label: 'Reports',
          icon: 'fas fa-chart-bar',
          route: '/regional-sales-manager-dashboard',
          children: [
            { label: 'Funnel Report', icon: 'fas fa-chart-bar', route: '/reports/funnel' },
            { label: 'Margin Analysis', icon: 'fas fa-chart-bar', route: '/reports/margin-analysis' },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-bar', route: '/reports/margin-analysis-c-note' },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/reports/opportunity-lost' },
            { label: 'Open Orders', icon: 'fas fa-chart-bar', route: '/reports/OpenOrders' },
            { label: 'Stock In Hand', icon: 'fas fa-chart-bar', route: '/reports/stock-in-hand' },
            { label: 'Fresh Business', icon: 'fas fa-chart-bar', route: '/reports/fresh-business' },
            { label: 'Target Vs Sales', icon: 'fas fa-chart-bar', route: '/reports/target-vs-sales' },
            { label: 'Runrate Projection', icon: 'fas fa-chart-bar', route: '/reports/runrate-projection' },
            { label: 'Incentives', icon: 'fas fa-chart-bar', route: '/reports/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-chart-bar', route: '/reports/outstanding' },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/regional-sales-manager-view-calendar'
        },
        {
          label: 'Leads',
          icon: 'fas fa-user-md',
          route: '/openleads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-edit',
          route: '/salesmanager/opportunities',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
            { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar',
          route: '/regional-sales-manager/plan-a-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-tachometer-alt', route: '/regional-sales-manager-dashboard/plan-a-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },

        {
          label: 'Manage Customer',
          icon: 'fas fa-users',
          route: '/regional-sales-manager-dashboard/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-copy',
          route: '/regional-sales-manager-dashboard/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-calendar',
          route: '/regional-sales-manager-dashboard/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar', route: '/regional-sales-manager-dashboard/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: '/regional-sales-manager-dashboard/track-purchase-order' }
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
            { label: 'Funnel Report', icon: 'fas fa-chart-bar', route: '/reports/funnel' },
            { label: 'Margin Analysis', icon: 'fas fa-chart-bar', route: '/reports/margin-analysis' },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-bar', route: '/reports/margin-analysis-c-note' },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/reports/opportunity-lost' },
            { label: 'Open Orders', icon: 'fas fa-chart-bar', route: '/reports/OpenOrders' },
            { label: 'Stock In Hand', icon: 'fas fa-chart-bar', route: '/reports/stock-in-hand' },
            { label: 'Fresh Business', icon: 'fas fa-chart-bar', route: '/reports/fresh-business' },
            { label: 'Target Vs Sales', icon: 'fas fa-chart-bar', route: '/reports/target-vs-sales' },
            { label: 'Runrate Projection', icon: 'fas fa-chart-bar', route: '/reports/runrate-projection' },
            { label: 'Incentives', icon: 'fas fa-chart-bar', route: '/reports/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-chart-bar', route: '/reports/outstanding' },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: '/country-head/dashboard/view-calendar'
        },
        {
          label: 'Leads',
          icon: 'fas fa-user-md',
          route: '/openleads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-edit',
          route: '/salesmanager/opportunities',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
            { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar',
          route: '/plan-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-tachometer-alt', route: '/plan-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
        {
          label: 'Approvals',
          icon: 'fas fa-thumbs-up',
          route: '/country-head/dashboard/approvals',
          children: [
            { label: 'Quote Approval', icon: 'fas fa-thumbs-up', route: '/quotes-view' },
            { label: 'Purchase Order Approval', icon: 'fas fa-thumbs-up', route: '/country-head/dashboard/purchase-order-approval' }
          ]
        },
        {
          label: 'Demo Products',
          icon: 'fas fa-lightbulb',
          route: '/country-head/dashboard/demo-product'
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-users',
          route: '/salesmanager/customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/salesmanager/customer' },
            { label: 'Contact', icon: 'fas fa-book', route: '/salesmanager/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-copy',
          route: '/country-head/dashboard/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-calendar',
          route: '/country-head/dashboard/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar', route: '/country-head/dashboard/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: '/country-head/dashboard/track-purchase-order' }
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
          icon: 'fas fa-user-md',
          route: '/openleads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-edit',
          route: '/salesmanager/opportunities',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
            { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar',
          route: '/plan-visit',
          children: [
            { label: 'Visit', icon: 'fas fa-tachometer-alt', route: '/plan-visit' },
            { label: 'Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
          ]
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-users',
          route: '/globalhead-dashboard/manage-customer',
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
            { label: 'Contact', icon: 'fas fa-book', route: '/contact' },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-copy',
          route: '/globalhead-dashboard/marketing-document'
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-calendar',
          route: '/globalhead-dashboard/track-quotes',
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar', route: '/globalhead-dashboard/track-quotes' },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: '/globalhead-dashboard/track-purchase-order' }
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
            { label: 'Funnel Report', icon: 'fas fa-chart-bar', route: `/funnel-report` },
            { label: 'Margin Analysis', icon: 'fas fa-chart-bar', route: `/margin-analysis` },
            { label: 'Margin Analysis (C-Note)', icon: 'fas fa-chart-bar', route: `/reports/margin-analysis-c-note` },
            { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: `/opportunity-lost` },
            { label: 'Open Orders', icon: 'fas fa-chart-bar', route: `/reports/OpenOrders` },
            { label: 'Stock In Hand', icon: 'fas fa-chart-bar', route: `/stock-in-hand-report` },
            { label: 'Fresh Business', icon: 'fas fa-chart-bar', route: `/fresh-business` },
            { label: 'Target Vs Sales', icon: 'fas fa-chart-bar', route: `/target-sales-report` },
            { label: 'Runrate Projection', icon: 'fas fa-chart-bar', route: `/runrate-projection` },
            { label: 'Incentives', icon: 'fas fa-chart-bar', route: '/reports/incentives' },
            { label: 'Outstanding Report', icon: 'fas fa-chart-bar', route: `/outstanding-report` },
          ]
        },
        {
          label: 'Calendar',
          icon: 'fas fa-calendar',
          route: `/view-calendar`
        },
        {
          label: 'Leads',
          icon: 'fas fa-user-md',
          route: '/openleads',
          children: [
            { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
            { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' }
          ]
        },
        {
          label: 'Opportunity',
          icon: 'fas fa-edit',
          route: '/salesmanager/opportunities',
          children: [
            { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
            { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
            { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' }
          ]
        },
        {
          label: 'Plan Visit/Demo',
          icon: 'fas fa-calendar',
          route: `/plan-visit`,
          children: [
            { label: 'Visit', icon: 'fas fa-tachometer-alt', route: `/plan-visit` },
            { label: 'Demo', icon: 'fas fa-suitcase', route: `/planDemo` }
          ]
        },
        {
          label: 'Approvals',
          icon: 'fas fa-thumbs-up',
          route: `/approvals`,
          children: [
            { label: 'CNote Approval', icon: 'fas fa-thumbs-up', route: `/c-note` },
            { label: 'Quote Approval', icon: 'fas fa-thumbs-up', route: `/quotes-view` },
            { label: 'Purchase Order Approval', icon: 'fas fa-thumbs-up', route: `/purchase-order-approval` }
          ]
        },
        {
          label: 'Demo Products',
          icon: 'fas fa-lightbulb',
          route: `/demo-product`
        },
        {
          label: 'Manage Customer',
          icon: 'fas fa-users',
          route: `/manage-customer`,
          children: [
            { label: 'Customer', icon: 'fas fa-user', route: `/customer` },
            { label: 'Contact', icon: 'fas fa-book', route: `/contact` },
          ]
        },
        {
          label: 'Marketing Documents',
          icon: 'fas fa-copy',
          route: `/marketing-document`
        },
        {
          label: 'Track Quote/PO',
          icon: 'fas fa-calendar',
          route: `/track-quotes`,
          children: [
            { label: 'Track Quotes', icon: 'fas fa-calendar', route: `/track-quotes` },
            { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: `/track-purchase-order` }
          ]
        }
      );
    }

     if (role === 'Customer Interaction Center') {
    this.menuItems.push(
       {
        label: 'Approve Leads',
        icon: 'fa fa-check',
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
          { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: '/dashboards/leads' },
          { label: 'Opportunity Dashboard', icon: 'fas fa-chart-bar', route: '/dashboards/opportunity' }
        ]
      },
      {
        label: 'Reports',
        icon: 'fas fa-chart-bar',
        route: '/reports',
        children: [
          { label: 'Funnel Report', icon: 'fas fa-chart-bar', route: '/reports/funnel' },
          { label: 'Opportunity Lost', icon: 'fas fa-chart-bar', route: '/reports/opportunity-lost' },
          { label: 'Open Orders', icon: 'fas fa-chart-bar', route: '/reports/OpenOrders' },
          { label: 'Stock In Hand', icon: 'fas fa-chart-bar', route: '/reports/stock-in-hand' },
          { label: 'Fresh Business report', icon: 'fas fa-chart-bar', route: '/reports/fresh-business' },
          { label: 'Target Vs Sales', icon: 'fas fa-chart-bar', route: '/reports/target-vs-sales' },
          { label: 'Runrate Projection', icon: 'fas fa-chart-bar', route: '/reports/runrate-projection' },
          { label: 'Incentives report', icon: 'fas fa-chart-bar', route: '/reports/incentives' }
        ]
      },
      {
        label: 'Calendar',
        icon: 'fas fa-calendar',
        route: '/calendar'
      },
      {
        label: 'Leads',
        icon: 'fas fa-user-md',
        route: '/leads',
        children: [
          { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
          { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
          { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' }
        ]
      },
      {
        label: 'Opportunity',
        icon: 'fas fa-edit',
        route: '/opportunity',
        children: [
          { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
          { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
          { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' }
        ]
      },
      {
        label: 'Plan Visit/ Demo',
        icon: 'fas fa-calendar',
        route: '/plan-visit-demo',
        children: [
          { label: 'Plan a Visit', icon: 'fas fa-tachometer-alt', route: '/plan-visit' },
          { label: 'Plan a Demo', icon: 'fas fa-suitcase', route: '/planDemo' }
        ]
      },
      {
        label: 'Manage Customer',
        icon: 'fas fa-users',
        route: '/manage-customer',
        children: [
          { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
          { label: 'Contact', icon: 'fas fa-book', route: '/contact' }
        ]
      },
      {
        label: 'Marketing Documents',
        icon: 'fas fa-copy',
        route: '/salesmanager/marketing-documents'
      },
      {
        label: 'Track Quote/PO',
        icon: 'fas fa-calendar',
        route: '/track-quote-po',
        children: [
          { label: 'Track Quotes', icon: 'fas fa-calendar', route: '/salesmanager/track-quotes' },
          { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: '/salesmanager/track-po' }
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
      icon: 'fas fa-tachometer-alt',
      route: '/salesdirector/leads',
      children: [
          { label: 'Leads Dashboard', icon: 'fas fa-tachometer-alt', route: '/' },
          { label: 'Oppurtunity Dashboard', icon: 'fas fa-chart-bar', route: '/' },

        ]
    },
    {
      label: 'Reports',
      icon: 'fas fa-chart-bar',
      route: '/salesdirector/opportunities',
      children: [
          { label: 'Funnel Report', icon: 'fas fa-chart-bar', route: '/' },
          { label: 'Oppurtunity Lost', icon: 'fas fa-chart-bar', route: '/' },
          { label: 'Open Orders', icon: 'fas fa-chart-bar', route: '/reports/OpenOrders' },
          { label: 'Stock In Hand', icon: 'fas fa-chart-bar', route: '/' },
          { label: 'Fresh Business Report', icon: 'fas fa-chart-bar', route: '/' },
          { label: 'Target Vs Sales', icon: 'fas fa-chart-bar', route: '/' },
          { label: 'Runrate Projection', icon: 'fas fa-chart-bar', route: '/' },
          { label: 'Incentives report', icon: 'fas fa-chart-bar', route: '/reports/incentives' },
        ]
    },
    {
      label: 'Calendar',
      icon: 'fas fa-calendar',
      route: '/salesdirector/calendar'
    },
    {
      label: 'Leads',
      icon: 'fas fa-user-md',
      route: '/openleads',
        children: [
          { label: 'New', icon: 'fas fa-edit', route: '/salesmanager/leads/add' },
          { label: 'Open', icon: 'fas fa-folder-open', route: '/openleads' },
          { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-leads' },
        ]
    },
    {
      label: 'Oppurtunity',
      icon: 'fas fa-edit',
      route: '/salesmanager/opportunities',
        children: [
          { label: 'Open', icon: 'fas fa-folder-open', route: '/salesmanager/opportunities' },
          { label: 'Closed', icon: 'fas fa-folder', route: '/salesmanager/closed-opportunities' },
          { label: 'Funnel History', icon: 'fas fa-clock', route: '/OppurtunityStatus/FunnelHistory' },
        ]
    },
    {
      label: 'Plan Visit/ Demo',
      icon: 'fas fa-calendar',
      route: '/salesdirector/report',
        children: [
          { label: 'Plan a Visit', icon: 'fas fa-tachometer-alt', route: '/salesdirector/planVisit' },
          { label: 'Plan a Demo', icon: 'fas fa-suitcase', route: '/planDemo' },
        ]
    },
    {
      label: 'Manage Customer',
      icon: 'fas fa-users',
      route: '/salesdirector/report',
        children: [
          { label: 'Customer', icon: 'fas fa-user', route: '/customer' },
          { label: 'Contact', icon: 'fas fa-book', route: '/contact' },
        ]
    },{
      label: 'Marketing Documents',
      icon: 'fas fa-copy',
      route: '/salesdirector/viewCampaignDocuments',
    },
    {
      label: 'Track Qoute/PO',
      icon: 'fas fa-calendar',
      route: '/salesdirector/report',
        children: [
          { label: 'Track Qoutes', icon: 'fas fa-calendar', route: '/salesdirector/track-quotes' },
          { label: 'Track Purchase Orders', icon: 'fas fa-calendar', route: '/salesdirector/track-po' },
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

