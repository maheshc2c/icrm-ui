import { AdminDashboard } from './pages/Admin/admin-dashboard/admin-dashboard';
import { Layout } from './layout/layout/layout';
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { SuperadminDashboard } from './pages/Superadmin/superadmin-dashboard/superadmin-dashboard';
import { OpenLeads } from './pages/SalesManager/open-leads/open-leads';
import { ClosedLeadsComponent } from './pages/SalesManager/closed-leads/closed-leads';
import { Addcompany } from './pages/Superadmin/addcompany/addcompany';
import { Competitor } from './pages/Admin/competitor/competitor';
import { AddCompetitor } from './pages/Admin/competitor/add-competitor/add-competitor';
import { AdminmarketingDashboard } from './pages/AdminMarketing/adminmarketing-dashboard/adminmarketing-dashboard';
import { SdDashboard } from './pages/SalesDirector/sd-dashboard/sd-dashboard';

export const routes: Routes = [

     {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'forgotpassword',
    loadComponent: () => import('./pages/login/forgotpassword/forgotpassword').then(m => m.Forgotpassword)
  },

  {
  path: '',
  loadComponent: () =>
    import('./layout/layout/layout').then(m => m.Layout),
  children: [
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    }
  ]
},

{
  path: 'superadmin/company',
  loadComponent: () =>
    import('./pages/Superadmin/company/company').then(m => m.Company)
},
{
  path: 'superadmin/addcompany',
  loadComponent: () =>
    import('./pages/Superadmin/addcompany/addcompany').then(m => m.Addcompany)
},
{
  path: 'superadmin/edit/:id',
  loadComponent: () =>
    import('./pages/Superadmin/addcompany/addcompany')
      .then(m => m.Addcompany)
},

//Admin Role
 {
        path: 'admindashboard',
        component: AdminDashboard,
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/manage-users',
        loadComponent: () =>
          import('./pages/Admin/manager-users/manage-users').then(m => m.ManageUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/add-users',
        loadComponent: () =>
          import('./pages/Admin/manager-users/add-users/add-users').then(m => m.AddUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/edit-user/:id',
        loadComponent: () =>
          import('./pages/Admin/manager-users/edit-users/edit-users').then(m => m.EditUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/view-user/:id',
        loadComponent: () =>
          import('./pages/Admin/manager-users/view-user/view-user').then(m => m.ViewUserComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/user-target',
        loadComponent: () =>
          import('./pages/Admin/target-role/target-role').then(m => m.TargetRoleComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/assign-target/:id',
        loadComponent: () =>
          import('./pages/Admin/target-role/assign-target/assign-target').then(m => m.AssignTargetComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/upload-target/:id',
        loadComponent: () =>
          import('./pages/Admin/target-role/upload-target/upload-target').then(m => m.UploadTargetComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
  path: 'admin/competitor',
  loadComponent: () =>
    import('./pages/Admin/competitor/competitor').then(m => m.Competitor)
},
{
  path: 'competitor/add',
  loadComponent: () =>
    import('./pages/Admin/competitor/add-competitor/add-competitor').then(m => m.AddCompetitor)
},
{
  path: 'competitor/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/competitor/add-competitor/add-competitor').then(m => m.AddCompetitor)
},
{
  path: 'customer',
  loadComponent: () =>
    import('./pages/Admin/customer/customer').then(m => m.Customer)
},
{
  path: 'customer/add',
  loadComponent: () =>
    import('./pages/Admin/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
},
{
  path: 'customer/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
},

//SubSystem
{
  path: 'admin/sub-system',
  loadComponent: () =>
    import('./pages/Admin/sub-system/sub-system').then(m => m.SubSystem)
},
{
  path: 'sub-system/add',
  loadComponent: () =>
    import('./pages/Admin/sub-system/addsubsystem/addsubsystem').then(m => m.Addsubsystem)
},

{
  path: 'sub-system/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/sub-system/addsubsystem/addsubsystem').then(m => m.Addsubsystem)
},
//Financial Yr

{
  path: 'admin/financial-yr',
  loadComponent: () =>
    import('./pages/Admin/financial-year/financial-year').then(m => m.FinancialYear)
},
{
  path: 'financial-yr/add',
  loadComponent: () =>
    import('./pages/Admin/financial-year/addfy/addfy').then(m => m.Addfy)
},
{
  path: 'financial-yr/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/financial-year/addfy/addfy').then(m => m.Addfy)
},

//UserLog
{
  path: 'admin/userlog',
  loadComponent: () =>
    import('./pages/Admin/userlog/userlog').then(m => m.Userlog)
},
//channel Partner
{
  path: 'admin/channelpartner',
  loadComponent: () =>
    import('./pages/Admin/channel-partner/channel-partner')
      .then(m => m.ChannelPartner)
},
{
  path: 'channelpartner/add',
  loadComponent: () =>
    import('./pages/Admin/channel-partner/addcp/addcp').then(m => m.Addcp)
},
{
  path: 'channelpartner/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/channel-partner/addcp/addcp').then(m => m.Addcp)
},


//Speciality

{
  path: 'admin/speciality',
  loadComponent: () =>
    import('./pages/Admin/speciality/speciality').then(m => m.Speciality)
},
{
  path: 'adminmarketing/speciality',
  loadComponent: () =>
    import('./pages/AdminMarketing/adminmarketing-dashboard/speciality/speciality').then(m => m.Speciality)
},
{
  path: 'speciality/add',
  loadComponent: () =>
    import('./pages/Admin/speciality/addspec/addspec').then(m => m.Addspec)
},
{
  path: 'adminmarketing/speciality/add',
  loadComponent: () => import('./pages/AdminMarketing/adminmarketing-dashboard/speciality/addspec/addspec').then(m => m.Addspec)
},
{
  path: 'speciality/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/speciality/addspec/addspec').then(m => m.Addspec)
},
{
  path: 'adminmarketing/speciality/edit/:id',
  loadComponent: () =>
    import('./pages/AdminMarketing/adminmarketing-dashboard/speciality/addspec/addspec').then(m => m.Addspec)
},


//Demo

{
  path: 'admin/demo',
  loadComponent: () =>
    import('./pages/Admin/demo/demo').then(m => m.Demo)
},
{
  path: 'admin/demo/add',
  loadComponent: () =>
    import('./pages/Admin/demo/add/add').then(m => m.Add)
},
{
  path: 'admin/demo/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/demo/add/add').then(m => m.Add)
},



//Contact
{
  path: 'contact',
  loadComponent: () =>
    import('./pages/Admin/contact/contact').then(m => m.Contact)
},
{
  path: 'contact/add',
  loadComponent: () =>
    import('./pages/Admin/contact/addcontact/addcontact').then(m => m.Addcontact)
},
{
  path: 'contact/edit/:id',
   loadComponent: () =>
    import('./pages/Admin/contact/addcontact/addcontact').then(m => m.Addcontact)
},

//teritory 
{
  path: 'admin/territory',
  loadComponent: () =>
    import('./pages/Admin/territory/territory').then(m => m.Territory)
},
//segment
{
        path: 'admin/segment',
        loadComponent: () =>
          import('./pages/Admin/segment/segment.component').then(m => m.SegmentComponent)
      },
      {
        path: 'admin/add-segment',
        loadComponent: () =>
          import('./pages/Admin/segment/add-segment/add-segment.component').then(m => m.AddSegment)
      },
      {
        path: 'admin/segment/edit/:id',
        loadComponent: () =>
          import('./pages/Admin/segment/edit-segment/edit-segment.component').then(m => m.EditSegment)
      },


//discount 

      {
  path: 'discountqoute',
  loadComponent: () =>
    import('./pages/Admin/discountqoute/discountqoute').then(m => m.Discountqoute),
},

//OtR

      {
  path: 'Cnotedownload',
  loadComponent: () =>
    import('./pages/OTR/otr-dashboard/otr-dashboard').then(m => m.OtrDashboard),
  canActivate: [authGuard],
  data: { roles: ['OTR'] }
},

 {
  path: 'comission',
  loadComponent: () =>
    import('./pages/OTR/commission/commission').then(m => m.Commission),
  canActivate: [authGuard],
  data: { roles: ['OTR'] }
},

// Category
{
  path: 'admin/category',
  loadComponent: () =>
    import('./pages/Admin/category/category').then(m => m.CategoryComponent),
  // canActivate: [authGuard],
  // data: { roles: ['ADMIN'] }
},
{
  path: 'admin/addcategory',
  loadComponent: () =>
    import('./pages/Admin/category/addcategory/addcategory').then(m => m.AddcategoryComponent),
},
{
  path: 'admin/editcategory/:id',
  loadComponent: () =>
    import('./pages/Admin/category/addcategory/addcategory').then(m => m.AddcategoryComponent),
},
//Geo
{
  path: 'admin/geo',
  loadComponent: () =>
    import('./pages/Admin/geo/geo').then(m => m.Geo),
},
{
  path: 'admin/addgeo',
  loadComponent: () =>
    import('./pages/Admin/geo/addgeo/addgeo').then(m => m.Addgeo),
},
{
  path: 'admin/editgeo/:id',
  loadComponent: () =>
    import('./pages/Admin/geo/addgeo/addgeo').then(m => m.Addgeo),
},

//Country
{
  path: 'admin/country',
  loadComponent: () =>
    import('./pages/Admin/country/country').then(m => m.CountryComponent),
 
},
{
  path: 'admin/addcountry',
  loadComponent: () =>
    import('./pages/Admin/country/addcountry/addcountry').then(m => m.Addcountry),

},
{
  path: 'admin/editcountry/:id',
  loadComponent: () =>
    import('./pages/Admin/country/addcountry/addcountry').then(m => m.Addcountry),
},
//Region
{
  path: 'admin/region',
  loadComponent: () =>
    import('./pages/Admin/region/region').then(m => m.RegionComponent),
  
},
{
  path: 'admin/addregion',
  loadComponent: () =>
    import('./pages/Admin/region/addregion/addregion').then(m => m.Addregion),
},
{
  path: 'admin/editregion/:id',
  loadComponent: () =>
    import('./pages/Admin/region/addregion/addregion').then(m => m.Addregion),
},

{
    path: 'admin/product',
    loadComponent: () =>
      import('./pages/Admin/product/product').then(m => m.Product),
     
  },
  {
    path: 'admin/add-product',
    loadComponent: () =>
      import('./pages/Admin/product/add-product/add-product.component').then(m => m.AddProduct)
  },
  {
    path: 'admin/product/edit/:id',
    loadComponent: () =>
      import('./pages/Admin/product/edit-product/edit-product.component').then(m => m.EditProduct)
  },

  


//State
{
  path: 'admin/state',
  loadComponent: () =>
    import('./pages/Admin/state/state').then(m => m.StateComponent),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/addstate',
  loadComponent: () =>
    import('./pages/Admin/state/addstate/addstate').then(m => m.Addstate),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/editstate/:id',
  loadComponent: () =>
    import('./pages/Admin/state/addstate/addstate').then(m => m.Addstate),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
 // District
{
  path: 'admin/district',
  loadComponent: () =>
    import('./pages/Admin/district/district').then(m => m.DistrictComponent),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/adddistrict',
  loadComponent: () =>
    import('./pages/Admin/district/adddistrict/adddistrict').then(m => m.Adddistrict),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/editdistrict/:id',
  loadComponent: () =>
    import('./pages/Admin/district/adddistrict/adddistrict').then(m => m.Adddistrict),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
 
//City

{
  path: 'admin/city',
  loadComponent: () =>
    import('./pages/Admin/city/city').then(m => m.CityComponent),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/addcity',
  loadComponent: () =>
    import('./pages/Admin/city/addcity/addcity').then(m => m.Addcity),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},


{
  path: 'admin/editcity/:id',
  loadComponent: () =>
    import('./pages/Admin/city/addcity/addcity').then(m => m.Addcity),
  canActivate: [authGuard],
  data: { roles: ['ADMIN'] }
},



{
        path: 'sddashboard',
        component: SdDashboard,
        canActivate: [authGuard],
        data: { roles: ['Sales Director'] }
      },

      {
  path: 'salesdirector/addleads',
  loadComponent: () =>
    import('./pages/SalesDirector/new/new').then(m => m.New),
},

  {
  path: 'oppurtunity/open',
  loadComponent: () =>
    import('./pages/SalesDirector/oppurtunity/oppurtunity').then(m => m.Oppurtunity),
},
 {
  path: 'oppurtunity/close',
  loadComponent: () =>
    import('./pages/SalesDirector/oppurtunity/opp-close/opp-close').then(m => m.OppClose),
},


{
  path: 'salesdirector/addleads/addcontact',
  loadComponent: () =>
    import('./pages/SalesDirector/new/addcontact/addcontact').then(m => m.Addcontact),
},
{
  path: 'salesdirector/addleads/addcustomer',
  loadComponent: () =>
    import('./pages/SalesDirector/new/addcustomer/addcustomer').then(m => m.Addcustomer),
},

 {
  path: 'salesdirector/track-quotes',
  loadComponent: () =>
    import('./pages/SalesDirector/TrackPO/track-quote/track-quote')
      .then(m => m.TrackQuote)
},

{
  path: 'salesdirector/track-po',
  loadComponent: () =>
    import('./pages/SalesDirector/TrackPO/track-po/track-po')
      .then(m => m.TrackPo)
},
{
  path: 'salesdirector/viewCampaignDocuments',
  loadComponent: () =>
    import('./pages/SalesDirector/marketing-doc/marketing-doc')
      .then(m => m.MarketingDoc)
},

{
  path: 'salesdirector/Demo',
  loadComponent: () =>
    import('./pages/SalesDirector/demo/demo')
      .then(m => m.Demo)
},
{
  path: 'salesdirector/planVisit',
  loadComponent: () =>
    import('./pages/SalesDirector/plan-visit/plan-visit')
      .then(m => m.PlanVisit)
},
{
  path: 'salesdirector/planVisit/add',
  loadComponent: () =>
    import('./pages/SalesDirector/plan-visit/add-visit/add-visit.component')
      .then(m => m.AddVisitComponent)
},
{
  path: 'salesdirector/planVisit/edit/:id',
  loadComponent: () =>
    import('./pages/SalesDirector/plan-visit/edit-visit/edit-visit.component')
      .then(m => m.EditVisitComponent)
},



//Contact
{
  path: 'salesdirector/contact',
  loadComponent: () =>
    import('./pages/SalesDirector/contact/contact').then(m => m.Contact)
},
{
  path: 'salesdirector/contact/add',
  loadComponent: () =>
    import('./pages/SalesDirector/contact/addcontact/addcontact').then(m => m.Addcontact)
},
{
  path: 'salesdirector/contact/edit/:id',
   loadComponent: () =>
    import('./pages/SalesDirector/contact/addcontact/addcontact').then(m => m.Addcontact)
},

{
  path: 'salesdirector/calender',
  loadComponent: () =>
    import('./pages/SalesDirector/calender/calender').then(m => m.Calender)
},

{
  path: 'salesdirector/customer',
  loadComponent: () =>
    import('./pages/SalesDirector/customer/customer').then(m => m.Customer)
},
{
  path: 'salesdirector/customer/add',
  loadComponent: () =>
    import('./pages/SalesDirector/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
},
{
  path: 'salesdirector/customer/edit/:id',
  loadComponent: () =>
    import('./pages/SalesDirector/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
},


{
        path: 'sales-manager-dashboard',
        loadComponent: () => import('./pages/SalesManager/salesmanager-dashboard/salesmanager-dashboard').then(m => m.SalesManagerDashboard),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/opportunities',
        loadComponent: () => import('./pages/SalesManager/opportunities/opportunities').then(m => m.OpportunitiesComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/closed-opportunities',
        loadComponent: () => import('./pages/SalesManager/closed-opportunities/closed-opportunities').then(m => m.ClosedOpportunitiesComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/funnel-history',
        loadComponent: () => import('./pages/SalesManager/funnel-history/funnel-history').then(m => m.FunnelHistoryComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/leads/add',
        loadComponent: () => import('./pages/SalesManager/leads/addlead/addlead').then(m => m.AddleadComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/leads/edit/:id',
        loadComponent: () => import('./pages/SalesManager/leads/addlead/addlead').then(m => m.AddleadComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/closed-leads',
        component: ClosedLeadsComponent,
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/customer',
        loadComponent: () => import('./pages/SalesManager/customer/customer').then(m => m.CustomerComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/customer/add',
        loadComponent: () => import('./pages/SalesManager/customer/addcustomer/addcustomer').then(m => m.AddcustomerComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/customer/edit/:id',
        loadComponent: () => import('./pages/SalesManager/customer/addcustomer/addcustomer').then(m => m.AddcustomerComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/contact',
        loadComponent: () => import('./pages/SalesManager/contact/contact').then(m => m.ContactComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/contact/add',
        loadComponent: () => import('./pages/SalesManager/contact/addcontact/addcontact').then(m => m.AddcontactComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/contact/edit/:id',
        loadComponent: () => import('./pages/SalesManager/contact/addcontact/addcontact').then(m => m.AddcontactComponent),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },

{
        path: 'national-sales-manager-dashboard',
        loadComponent: () => import('./pages/National Sales Manager/national-sales-manager-dashboard/national-sales-manager-dashboard').then(m => m.NationalSalesManagerDashboard),
        canActivate: [authGuard],
        data: { roles: ['National Sales Manager'] }
      },
      
      
      {
        path: 'globalhead-dashboard',
        loadComponent: () => import('./pages/GlobalHead/globalhead-dashboard/globalhead-dashboard').then(m => m.GlobalheadDashboard),
        // canActivate: [authGuard],
        // data: { roles: ['GLOBALHEAD'] }
      },

      {
        path: 'globalhead/add-visit',
        loadComponent: () => import('./pages/GlobalHead/manage-visits/add-visit/add-visit.component').then(m => m.AddVisitComponent),
      },
      {
        path: 'globalhead/manage-visits',
        loadComponent: () => import('./pages/GlobalHead/manage-visits/manage-visits.component').then(m => m.ManageVisitsComponent),

      },
      {
        path: 'globalhead/edit-visit/:id',
        loadComponent: () => import('./pages/GlobalHead/manage-visits/edit-visit/edit-visit.component').then(m => m.EditVisitComponent),

      },
      {
        path: 'globalhead-dashboard/plan-demo',
        loadComponent: () => import('./pages/GlobalHead/plan-demo/plan-demo.component').then(m => m.PlanDemoComponent),
      },



      //Global Head Routes

        {
        path: 'country-head',
        loadComponent: () => import('./pages/ContryHead/country-head-dashborad/country-head-dashborad').then(m => m.CountryHead),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },

      {
        path: 'Approve-Leads',
        loadComponent: () => import('./pages/Customer Interaction Center/approve-leads/approve-leads').then(m => m.ApproveLeads),
        canActivate: [authGuard],
        data: { roles: ['Customer Interaction Center'] }
      },
      {
        path: 'SO-Number-Open',
        loadComponent: () => import('./pages/Customer Interaction Center/So-Number-Entry/so-entry-open/so-entry-open').then(m => m.SoEntryOpen), 
        canActivate: [authGuard],
        data: { roles: ['Customer Interaction Center'] }   
      },
      {
        path: 'SO-Number-close',
        loadComponent: () => import('./pages/Customer Interaction Center/So-Number-Entry/so-entry-close/so-entry-close').then(m => m.SoEntryClose),
      canActivate: [authGuard],
        data: { roles: ['Customer Interaction Center'] }
      },



        {
        path: 'regional-branch-head-dashboard',
        loadComponent: () => import('./pages/Regional-Branch-Head/regional-branch-head/regional-branch-head').then(m => m.RegionalBranchHead),
        canActivate: [authGuard],
        data: { roles: ['Regional Branch Head'] }
      },

      {
        path: 'quotes-view',
        loadComponent: () => import('./pages/Regional-Branch-Head/quote-approval/quote-approval').then(m => m.QuoteApproval),
      },
      {
        path: 'c-note',
        loadComponent: () => import('./pages/Regional-Branch-Head/c-note-approval/c-note-approval').then(m => m.CNoteApproval),
      },
      {
        path: 'PO-Approval',
        loadComponent: () => import('./pages/Regional-Branch-Head/purchase-order-approval/purchase-order-approval').then(m => m.PurchaseOrderApproval),
      },



        {
        path: 'regional-sales-manager-dashboard',
        loadComponent: () => import('./pages/Regional-Sales-Manager/regional-sales-manager-dashboard/regional-sales-manager-dashboard').then(m => m.RegionalSalesManagerDashboard),
        canActivate: [authGuard],
        data: { roles: ['Regional Sales Manager'] }
      },

      {
        path: 'superadmindashboard',
        component: SuperadminDashboard,
        canActivate: [authGuard],
        data: { roles: ['SUPERADMIN'] }
      },
        

       {
    path: 'superadmin/manage-users',
    loadComponent: () =>
      import('./pages/Superadmin/superadmin-manage-users/superadmin-manage-users').then(m => m.SuperadminManageUsers)
  },

{
          path: 'superadmin/add-manage-user',
    loadComponent: () =>
      import('./pages/Superadmin/superadmin-manage-users/add-manage-user/add-manage-user').then(m => m.AddManageUser)
  },
  {
    path: 'superadmin/edit-manage-user/:id',
    loadComponent: () =>
      import('./pages/Superadmin/superadmin-manage-users/edit-manage-user/edit-manage-user').then(m => m.EditManageUserComponent)
      },

      
       {
        path: 'openleads',
        component: OpenLeads,
        canActivate: [authGuard],
        data: { roles: ['SUPERADMIN', 'Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },



  //admin marketing
   {
        path: 'adminmarketingdashboard',
        component: AdminmarketingDashboard,
        canActivate: [authGuard],
        data: { roles: ['ADMINMARKETING'] }
      },

      { path: '**', redirectTo: 'login' },




     


];
