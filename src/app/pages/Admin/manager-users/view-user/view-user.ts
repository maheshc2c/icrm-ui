import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Userservice } from '../../../../service/userservice';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Pageheader],
  providers: [Userservice],
  templateUrl: './view-user.html',
  styleUrl: './view-user.css'
})
export class ViewUserComponent implements OnInit {

  constructor(
    private userService: Userservice,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ─── Header ─────────────────────────────────────────── */
  headerTitle = 'View User Profile';
  headerBreadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/admindashboard' },
    { label: 'Manage Users', route: '/admin/manage-users' },
    { label: 'View User' }
  ];

  /* ─── State ───────────────────────────────────────────── */
  userId!: number;
  userData: any = null;
  userName = '';
  isUserLoading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert('User ID not provided');
      this.router.navigate(['/admin/manage-users']);
      return;
    }
    this.userId = +id;
    this.loadUser();
  }

  private loadUser(): void {
    this.isUserLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (result: any) => {
        console.log('Fetched user view profile:', result);
        const user = Array.isArray(result) ? result[0] : result;
        this.userData = user;
        
        if (user) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          this.userName = fullName || user.username || 'User';
          const roleLabel = user.roleName ? ` (${user.roleName})` : '';
          
          this.headerBreadcrumbs = [
            { label: 'Home', route: '/admindashboard' },
            { label: 'Manage Users', route: '/admin/manage-users' },
            { label: `View ${this.userName}${roleLabel}` }
          ];
        }
        this.isUserLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load user profile details:', err);
        alert('Could not retrieve user details.');
        this.router.navigate(['/admin/manage-users']);
      }
    });
  }
}
