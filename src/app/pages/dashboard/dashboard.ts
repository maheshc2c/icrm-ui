import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Breadcrumb } from '../../models/breadcrumb';
import { Pageheader } from '../../shared/pageheader/pageheader';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, FormsModule, Pageheader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard
{


//  role = localStorage.getItem('role') || 'GUEST';


// dashboardConfig: any = {
//   SUPERADMIN: [
//     {
//       title: "Manage Users test",
//       icon: "fas fa-cogs",
//       cards: [
//         { title: "Admin Users", route: "/super-admin/admin-users", icon: "fas fa-user-shield" }
//       ]
//     },
//     {
//       title: "Manage Company",
//       icon: "fas fa-building",
//       cards: [
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" },
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" },
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" },
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" }

//       ]
//     },
//      {
//       title: "Manage Company",
//       icon: "fas fa-building",
//       cards: [
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" },
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" }
//       ]
//     },
//      {
//       title: "Manage Company",
//       icon: "fas fa-building",
//       cards: [
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" },
//         { title: "Company", route: "/superadmin/company", icon: "fas fa-building" }
//       ]
//     }
//   ],

//   ADMIN: [
//     {
//       title: "Manage",
//       icon: "fas fa-users-cog",
//       cards: [
//         { title: "Users", route: "/admin/manage-user", icon: "fas fa-users" }
//       ]
//     },
//     {
//       title: "Manage Product Details",
//       icon: "fas fa-clipboard-list",
//       cards: [
//         { title: "Category", route: "/admin/category", icon: "fas fa-th-large" },
//         { title: "Group", route: "/admin/segment", icon: "fas fa-layer-group" },
//         { title: "Products", route: "/admin/product", icon: "fas fa-box" },
//         { title: "Competitor", route: "/admin/competitor", icon: "fas fa-chart-line" },
//         { title: "Demo", route: "/admin/demo", icon: "fas fa-laptop" },
//         { title: "User-Target", route: "/admin/user-target", icon: "fas fa-bullseye" }
//       ]
//     }
//   ]
// };


}
