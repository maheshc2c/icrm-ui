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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onLogin(): void {
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

          // ROLE BASED NAVIGATION
          switch (decoded.role) {

            case 'ADMIN':
              this.router.navigateByUrl('/admindashboard');
              break;

            case 'SUPERADMIN':
              this.router.navigateByUrl('/superadmindashboard');
              break;
              
              case 'Sales Director':
              this.router.navigateByUrl('/sddashboard');
              break;

              case 'Sales Engineer':
              this.router.navigateByUrl('/sales-manager-dashboard');
              break;

              case 'ADMINMARKETING':
              this.router.navigateByUrl('/adminmarketingdashboard');
              break;

              case 'National Sales Manager':
              this.router.navigateByUrl('/national-sales-manager-dashboard');
              break;

              case 'Regional Branch Head':
              this.router.navigateByUrl('/regional-branch-head-dashboard');
              break;
              
              case 'Regional Sales Manager':
              this.router.navigateByUrl('/regional-sales-manager-dashboard');
              break;

              case 'Global Head':
              this.router.navigateByUrl('/globalhead-dashboard');
              break;

              case 'Country Head':
              this.router.navigateByUrl('/country-head');
              break;

              case 'Customer Interaction Center':
              this.router.navigateByUrl('/Approve-Leads');
              break;

              case 'OTR':
              this.router.navigateByUrl('/Cnotedownload');
              break;
              

            default:
              this.router.navigateByUrl('/login');
              break;
          }
          

        } catch (e) {
          console.error('JWT decode error', e);
          this.errorMessage = 'Invalid token';
        }
      },

      error: (err) => {
        this.errorMessage = err.error || 'Login failed';
      }

    });
  }
}
