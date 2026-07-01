import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { JwtPayload } from './jwt-payload';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onLogin(): void {
    if (this.isLoading) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({

      next: (token: string) => {
        // save token
        this.authService.saveToken(token);

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          console.log('User Role:', decoded.role);

          // save role
          localStorage.setItem('role', decoded.role);
          localStorage.setItem('sub', decoded.sub);
          localStorage.setItem('firstName', decoded.firstName);
          localStorage.setItem('lastName', decoded.lastName);

          this.successMessage = 'Login successful! Redirecting...';
          this.isLoading = false;

          const normalizedRole = decoded.role ? decoded.role.replace(/[\s_]+/g, '').toUpperCase() : '';

          // ROLE BASED NAVIGATION (Delayed by 1200ms for premium visual transition)
          setTimeout(() => {
            switch (normalizedRole) {

              case 'ADMIN':
                this.router.navigateByUrl('/admindashboard');
                break;

              case 'SUPERADMIN':
                this.router.navigateByUrl('/superadmindashboard');
                break;
                
              case 'SALESDIRECTOR':
                this.router.navigateByUrl('/sddashboard');
                break;

              case 'SALESENGINEER':
              case 'SALESMANAGER':
                this.router.navigateByUrl('/sales-manager-dashboard');
                break;

              case 'ADMINMARKETING':
                this.router.navigateByUrl('/adminmarketingdashboard');
                break;

              case 'NATIONALSALESMANAGER':
                this.router.navigateByUrl('/national-sales-manager-dashboard');
                break;

              case 'REGIONALBRANCHHEAD':
                this.router.navigateByUrl('/regional-branch-head-dashboard');
                break;
                
              case 'REGIONALSALESMANAGER':
                this.router.navigateByUrl('/regional-sales-manager-dashboard');
                break;

              case 'GLOBALHEAD':
                this.router.navigateByUrl('/globalhead-dashboard');
                break;

              case 'COUNTRYHEAD':
                this.router.navigateByUrl('/country-head');
                break;

              case 'CUSTOMERINTERACTIONCENTER':
                this.router.navigateByUrl('/Approve-Leads');
                break;

              case 'OTR':
                this.router.navigateByUrl('/Cnotedownload');
                break;

              default:
                this.router.navigateByUrl('/login');
                break;
            }
          }, 1200);

        } catch (e) {
          console.error('JWT decode error', e);
          this.errorMessage = 'Invalid token';
          this.isLoading = false;
        }
      },

      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Login failed. Please check your credentials.';
      }

    });
  }
}
