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
    },
    // ── Funnel Report (common-modules) ──────────────────────────────────
    {
      path: 'reports/funnel',
      loadComponent: () =>
        import('./pages/common-modules/reports/funnel-report/funnel-report').then(m => m.FunnelReportComponent),
      canActivate: [authGuard],
      data: {
        roles: [
          'Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER',
          'Regional Sales Manager', 'Regional Branch Head',
          'Country Head', 'National Sales Manager', 'Global Head',
          'Sales Director', 'ADMIN'
        ]
      }
    },
    {
      path: 'funnel-report',
      loadComponent: () =>
        import('./pages/common-modules/reports/funnel-report/funnel-report').then(m => m.FunnelReportComponent),
      canActivate: [authGuard],
      data: {
        roles: [
          'Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER',
          'Regional Sales Manager', 'Regional Branch Head',
          'Country Head', 'National Sales Manager', 'Global Head',
          'Sales Director', 'ADMIN'
        ]
      }
    }
  ]
},
{
  path: 'quoteRevision/:id',
  loadComponent: () =>
    import('./pages/quote-revision/quote-revision').then(m => m.QuoteRevisionComponent),
  canActivate: [authGuard],
  data: { roles: ['SUPERADMIN', 'SUPER ADMIN', 'Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
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
        path: 'admin/delete-contract-note',
        loadComponent: () =>
          import('./pages/Admin/delete-contract-note/delete-contract-note').then(m => m.DeleteContractNote),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/Admin/manager-users/manage-users').then(m => m.ManageUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users/add',
        loadComponent: () =>
          import('./pages/Admin/manager-users/add-users/add-users').then(m => m.AddUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./pages/Admin/manager-users/edit-users/edit-users').then(m => m.EditUsersComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users/view/:id',
        loadComponent: () =>
          import('./pages/Admin/manager-users/view-user/view-user').then(m => m.ViewUserComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'user-target',
        loadComponent: () =>
          import('./pages/Admin/target-role/target-role').then(m => m.TargetRoleComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'assign-target/:id',
        loadComponent: () =>
          import('./pages/Admin/target-role/assign-target/assign-target').then(m => m.AssignTargetComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'upload-target/:id',
        loadComponent: () =>
          import('./pages/Admin/target-role/upload-target/upload-target').then(m => m.UploadTargetComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      },
      { path: 'admin/user-target', redirectTo: 'user-target', pathMatch: 'full' },
      { path: 'admin/assign-target/:id', redirectTo: 'assign-target/:id', pathMatch: 'full' },
      { path: 'admin/upload-target/:id', redirectTo: 'upload-target/:id', pathMatch: 'full' },
      {
  path: 'competitor',
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
      import('./pages/common-modules/customer/customer').then(m => m.Customer)
  },
  {
    path: 'customer/add',
    loadComponent: () =>
      import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
  },
  {
    path: 'customer/edit/:id',
    loadComponent: () =>
      import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
  },

//SubSystem
{
  path: 'sub-system',
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
  path: 'financial-yr',
  loadComponent: () =>
    import('./pages/Admin/financial-year/financial-year').then(m => m.FinancialYear)
},
{
  path: 'financial-yr/add',
  loadComponent: () =>
    import('./pages/Admin/financial-year/addfy/addfy').then(m => m.Addfy)
},
{
  path: 'financial-year-calendar',
  loadComponent: () =>
    import('./pages/Admin/financial-year/calender/financial-year-calender/financial-year-calender').then(m => m.FinancialYearCalender)
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
  path: 'speciality',
  loadComponent: () =>
    import('./pages/common-modules/speciality/speciality').then(m => m.Speciality)
},
{
  path: 'speciality/add',
  loadComponent: () =>
    import('./pages/common-modules/speciality/addspec/addspec').then(m => m.Addspec)
},
{
  path: 'speciality/edit/:id',
  loadComponent: () =>
    import('./pages/common-modules/speciality/addspec/addspec').then(m => m.Addspec)
},


//Demo Product

{
  path: 'demoproduct',
  loadComponent: () =>
    import('./pages/Admin/demo/demo').then(m => m.Demo)
},
{
  path: 'demoproduct/add',
  loadComponent: () =>
    import('./pages/Admin/demo/add/add').then(m => m.Add)
},
{
  path: 'demoproduct/edit/:id',
  loadComponent: () =>
    import('./pages/Admin/demo/add/add').then(m => m.Add)
},

{ path: 'admin/demo', redirectTo: 'demoproduct', pathMatch: 'full' },
{ path: 'admin/demo/add', redirectTo: 'demoproduct/add', pathMatch: 'full' },
{ path: 'admin/demo/edit/:id', redirectTo: 'demoproduct/edit/:id', pathMatch: 'full' },



//Contact

{
  path: 'contact',
  loadComponent: () =>
    import('./pages/common-modules/contact/contact').then(m => m.Contact)
},
{
  path: 'contact/add',
  loadComponent: () =>
    import('./pages/common-modules/contact/addcontact/addcontact').then(m => m.Addcontact)
},
{
  path: 'contact/edit/:id',
   loadComponent: () =>
    import('./pages/common-modules/contact/addcontact/addcontact').then(m => m.Addcontact)
},

//teritory 
{
  path: 'admin/territory',
  loadComponent: () =>
    import('./pages/Admin/territory/territory').then(m => m.Territory)
},
//segment
        {
          path: 'segment',
          loadComponent: () =>
            import('./pages/Admin/segment/segment.component').then(m => m.SegmentComponent),
          canActivate: [authGuard],
          data: { roles: ['ADMIN'] }
        },
        {
          path: 'segment/add',
          loadComponent: () =>
            import('./pages/Admin/segment/add-segment/add-segment.component').then(m => m.AddSegment),
          canActivate: [authGuard],
          data: { roles: ['ADMIN'] }
        },
        {
          path: 'segment/edit/:id',
          loadComponent: () =>
            import('./pages/Admin/segment/edit-segment/edit-segment.component').then(m => m.EditSegment),
          canActivate: [authGuard],
          data: { roles: ['ADMIN'] }
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
  path: 'geo',
  loadComponent: () =>
    import('./pages/Admin/geo/geo').then(m => m.Geo),
},
{
  path: 'addgeo',
  loadComponent: () =>
    import('./pages/Admin/geo/addgeo/addgeo').then(m => m.Addgeo),
},
{
  path: 'editgeo/:id',
  loadComponent: () =>
    import('./pages/Admin/geo/addgeo/addgeo').then(m => m.Addgeo),
},

//Country
{
  path: 'country',
  loadComponent: () =>
    import('./pages/Admin/country/country').then(m => m.CountryComponent),
 
},
{
  path: 'addcountry',
  loadComponent: () =>
    import('./pages/Admin/country/addcountry/addcountry').then(m => m.Addcountry),

},
{
  path: 'editcountry/:id',
  loadComponent: () =>
    import('./pages/Admin/country/addcountry/addcountry').then(m => m.Addcountry),
},
//Region
{
  path: 'region',
  loadComponent: () =>
    import('./pages/Admin/region/region').then(m => m.RegionComponent),
  
},
{
  path: 'addregion',
  loadComponent: () =>
    import('./pages/Admin/region/addregion/addregion').then(m => m.Addregion),
},
{
  path: 'editregion/:id',
  loadComponent: () =>
    import('./pages/Admin/region/addregion/addregion').then(m => m.Addregion),
},

  {
    path: 'product',
      loadComponent: () =>
      import('./pages/Admin/product/product').then(m => m.Product),
      canActivate: [authGuard],
      data: { roles: ['ADMIN'] }
    },
    {
    path: 'product/add',
      loadComponent: () =>
      import('./pages/Admin/product/add-product/add-product.component').then(m => m.AddProduct),
      canActivate: [authGuard],
      data: { roles: ['ADMIN'] }
    },
    {
    path: 'product/edit/:id',
      loadComponent: () =>
      import('./pages/Admin/product/edit-product/edit-product.component').then(m => m.EditProduct),
      canActivate: [authGuard],
      data: { roles: ['ADMIN'] }
    },

  


//State
{
  path: 'state',
  loadComponent: () =>
    import('./pages/Admin/state/state').then(m => m.StateComponent),
},
{
  path: 'addstate',
  loadComponent: () =>
    import('./pages/Admin/state/addstate/addstate').then(m => m.Addstate),
},
{
  path: 'editstate/:id',
  loadComponent: () =>
    import('./pages/Admin/state/addstate/addstate').then(m => m.Addstate),
},
 // District
{
  path: 'district',
  loadComponent: () =>
    import('./pages/Admin/district/district').then(m => m.DistrictComponent),
},
{
  path: 'adddistrict',
  loadComponent: () =>
    import('./pages/Admin/district/adddistrict/adddistrict').then(m => m.Adddistrict),
},
{
  path: 'editdistrict/:id',
  loadComponent: () =>
    import('./pages/Admin/district/adddistrict/adddistrict').then(m => m.Adddistrict),
},
 
//City

{
  path: 'city',
  loadComponent: () =>
    import('./pages/Admin/city/city').then(m => m.CityComponent),
},
{
  path: 'addcity',
  loadComponent: () =>
    import('./pages/Admin/city/addcity/addcity').then(m => m.Addcity),
},


{
  path: 'editcity/:id',
  loadComponent: () =>
    import('./pages/Admin/city/addcity/addcity').then(m => m.Addcity),
},



{
        path: 'sddashboard',
        component: SdDashboard,
        canActivate: [authGuard],
        data: { roles: ['Sales Director'] }
      },

//       {
//   path: 'salesdirector/addleads',
//   loadComponent: () =>
//     import('./pages/SalesDirector/new/new').then(m => m.New),
// },

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


// {
//   path: 'salesdirector/addleads/addcontact',
//   loadComponent: () =>
//     import('./pages/SalesDirector/new/addcontact/addcontact').then(m => m.Addcontact),
// },
// {
//   path: 'salesdirector/addleads/addcustomer',
//   loadComponent: () =>
//     import('./pages/SalesDirector/new/addcustomer/addcustomer').then(m => m.Addcustomer),
// },

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
    import('./pages/common-modules/customer/customer').then(m => m.Customer)
},
{
  path: 'salesdirector/customer/add',
  loadComponent: () =>
    import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
},
{
  path: 'salesdirector/customer/edit/:id',
  loadComponent: () =>
    import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer)
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
        loadComponent: () => import('./pages/common-modules/customer/customer').then(m => m.Customer),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/customer/add',
        loadComponent: () => import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'salesmanager/customer/edit/:id',
        loadComponent: () => import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer),
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
        path: 'planDemo',
        loadComponent: () => import('./pages/common-modules/planDemo/demo').then(m => m.Demo),
      },
      {
        path: 'planDemo/Add',
        loadComponent: () => import('./pages/common-modules/planDemo/add-plan-demo/add-plan-demo').then(m => m.AddPlanDemo),
      },
       {
        path: 'planDemo/edit/:id',
        loadComponent: () => import('./pages/common-modules/planDemo/add-plan-demo/add-plan-demo').then(m => m.AddPlanDemo),
        // canActivate: [authGuard],
        // data: { roles: ['Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER',] }
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
        path: 'plan-visit/add',
        loadComponent: () => import('./pages/GlobalHead/manage-visits/add-visit/add-visit.component').then(m => m.AddVisitComponent),
        canActivate: [authGuard],
        data: { roles: ['Country Head', 'Global Head', 'National Sales Manager', 'Regional Sales Manager', 'Regional Branch Head', 'Sales Director', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'plan-visit',
        loadComponent: () => import('./pages/GlobalHead/manage-visits/manage-visits.component').then(m => m.ManageVisitsComponent),
        canActivate: [authGuard],
        data: { roles: ['Country Head', 'Global Head', 'National Sales Manager', 'Regional Sales Manager', 'Regional Branch Head', 'Sales Director', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      {
        path: 'plan-visit/edit/:id',
        loadComponent: () => import('./pages/GlobalHead/manage-visits/edit-visit/edit-visit.component').then(m => m.EditVisitComponent),
        canActivate: [authGuard],
        data: { roles: ['Country Head', 'Global Head', 'National Sales Manager', 'Regional Sales Manager', 'Regional Branch Head', 'Sales Director', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },
      { path: 'plan-visits', redirectTo: 'plan-visit', pathMatch: 'full' },
      { path: 'plan-edit/:id', redirectTo: 'plan-visit/edit/:id', pathMatch: 'full' },
      { path: 'globalhead/manage-visits', redirectTo: 'plan-visit', pathMatch: 'full' },
      { path: 'globalhead/add-visit', redirectTo: 'plan-visit/add', pathMatch: 'full' },
      { path: 'globalhead/edit-visit/:id', redirectTo: 'plan-visit/edit/:id', pathMatch: 'full' },
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
        path: 'country-head/marketing-document',
        loadComponent: () => import('./pages/common-modules/marketing-document/marketing-document').then(m => m.MarketingDocumentComponent),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/dashboard/marketing-document',
        loadComponent: () => import('./pages/common-modules/marketing-document/marketing-document').then(m => m.MarketingDocumentComponent),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/dashboard/track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/dashboard/track-po',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/track-po',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/dashboard/track-purchase-order',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },
      {
        path: 'country-head/track-purchase-order',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Country Head'] }
      },

      // Regional Branch Head Track Quote/PO
      {
        path: 'regional-branch-head/track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Regional Branch Head'] }
      },
      {
        path: 'regional-branch-head/track-purchase-order',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Regional Branch Head'] }
      },

      // Regional Sales Manager Track Quote/PO
      {
        path: 'regional-sales-manager-dashboard/track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Regional Sales Manager'] }
      },
      {
        path: 'regional-sales-manager-dashboard/track-purchase-order',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Regional Sales Manager'] }
      },

      // Global Head Track Quote/PO
      {
        path: 'globalhead-dashboard/track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Global Head'] }
      },
      {
        path: 'globalhead-dashboard/track-purchase-order',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Global Head'] }
      },

      // Sales Engineer Track Quote/PO
      {
        path: 'track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'National Sales Manager'] }
      },
      {
        path: 'track-purchase-order',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Sales Engineer', 'National Sales Manager'] }
      },

      // Sales Manager Track Quote/PO
      {
        path: 'salesmanager/track-quotes',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/quote-tracking/quote-tracking').then(m => m.QuoteTracking),
        canActivate: [authGuard],
        data: { roles: ['Sales Manager', 'SALES_MANAGER', 'SALESMANAGER', 'Sales Engineer'] }
      },
      {
        path: 'salesmanager/track-po',
        loadComponent: () => import('./pages/common-modules/TrackQuotePo/purchase-order-tracking/purchase-order-tracking').then(m => m.PurchaseOrderTracking),
        canActivate: [authGuard],
        data: { roles: ['Sales Manager', 'SALES_MANAGER', 'SALESMANAGER', 'Sales Engineer'] }
      },

      {
        path: 'Approve-Leads',
        loadComponent: () => import('./pages/Customer Interaction Center/approve-leads/approve-leads').then(m => m.ApproveLeads),
        canActivate: [authGuard],
        data: { roles: ['Customer Interaction Center'] }
      },
      {
        path: 'Approve-Leads/edit/:id',
        loadComponent: () => import('./pages/Customer Interaction Center/approve-leads/edit-leads/edit-leads').then(m => m.EditLeads),
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
        loadComponent: () => import('./pages/common-modules/quote-approval/quote-approval').then(m => m.QuoteApproval),
      },
      {
        path: 'c-note',
        loadComponent: () => import('./pages/common-modules/c-note-approval/c-note-approval').then(m => m.CNoteApproval),
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
        data: { roles: ['SUPERADMIN', 'SUPER ADMIN'] }
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
        data: { roles: ['SUPERADMIN', 'SUPER ADMIN', 'SUPER ADMIN', 'Sales Engineer', 'Sales Manager', 'SALES_MANAGER', 'SALESMANAGER'] }
      },



  //admin marketing
   {
        path: 'adminmarketingdashboard',
        component: AdminmarketingDashboard,
        canActivate: [authGuard],
        data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
      },

      {
          path: 'adminmarketing/compaign',
          loadComponent: () => import('./pages/AdminMarketing/compaign/compaign').then(m => m.ManageCompaign),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/compaign/add',
          loadComponent: () => import('./pages/AdminMarketing/compaign/addcompaign/addcompaign').then(m => m.AddCompaign),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/compaign/edit/:id',
          loadComponent: () => import('./pages/AdminMarketing/compaign/addcompaign/addcompaign').then(m => m.AddCompaign),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
  
        {
          path: 'adminmarketing/managedacument',
          loadComponent: () => import('./pages/common-modules/marketing-document/marketing-document').then(m => m.MarketingDocumentComponent),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/managedacument/add',
          loadComponent: () => import('./pages/AdminMarketing/managedacument/adddocument/adddocument').then(m => m.AddDocument),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/managedacument/edit/:id',
          loadComponent: () => import('./pages/AdminMarketing/managedacument/adddocument/adddocument').then(m => m.AddDocument),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
  
        {
          path: 'adminmarketing/assing-leads',
          loadComponent: () => import('./pages/AdminMarketing/assing-leads/assing-leads').then(m => m.AssignLeads),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/track-leads',
          loadComponent: () => import('./pages/AdminMarketing/track-leads/track-leads').then(m => m.TrackLeads),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/track-leads/open-leads',
          loadComponent: () => import('./pages/AdminMarketing/track-leads/open-leads/open-leads').then(m => m.OpenLeads),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
  
        {
          path: 'adminmarketing/customer',
          loadComponent: () => import('./pages/common-modules/customer/customer').then(m => m.Customer),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/customer/add',
          loadComponent: () => import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/customer/edit/:id',
          loadComponent: () => import('./pages/common-modules/customer/addcustomer/addcustomer').then(m => m.Addcustomer),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
  
        {
          path: 'adminmarketing/contact',
          loadComponent: () => import('./pages/AdminMarketing/contact/contact').then(m => m.Contact),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/contact/add',
          loadComponent: () => import('./pages/AdminMarketing/contact/addcontact/addcontact').then(m => m.Addcontact),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
        {
          path: 'adminmarketing/contact/edit/:id',
          loadComponent: () => import('./pages/AdminMarketing/contact/addcontact/addcontact').then(m => m.Addcontact),
          canActivate: [authGuard],
          data: { roles: ['ADMINMARKETING', 'ADMIN MARKETING'] }
        },
  



      { path: '**', redirectTo: 'login' },




     


];

