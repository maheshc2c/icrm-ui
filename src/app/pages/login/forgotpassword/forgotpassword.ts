import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgotpassword.html',
  styleUrl: './forgotpassword.css',
})
export class Forgotpassword {

  employeeId = '';
  email = '';

  errorMessage = '';
  showSuccessMessage = false;

  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';

    const employeeId = (this.employeeId || '').trim();
    const email = (this.email || '').trim();

    if (!employeeId || !email) {
      this.errorMessage = 'Please enter both Employee ID and Email Address.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.showSuccessMessage = true;
    this.employeeId = '';
    this.email = '';

    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }

    this.redirectTimer = setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, 3000);
  }

}
