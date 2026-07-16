import { Component, Inject, PLATFORM_ID, OnInit, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterEvent } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  role: string | null = null;
  originalRole: string | null = null;
  sub: string | null = null;
  userId: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  showRoleInfo = true;
  showDropdown = false;
  showSettingsDropdown = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role');
      this.sub = localStorage.getItem('sub');
      this.firstName = localStorage.getItem('firstName');
      this.lastName = localStorage.getItem('lastName');

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          this.originalRole = decoded.role;
        } catch (e) {
          console.error('Failed to decode token in header');
        }
      }
    }
  }

  switchRole(newRole: string, path: string): void {
    localStorage.setItem('role', newRole);
    window.location.href = path;
  }

  onSwitchRoleClick(): void {
    this.showDropdown = !this.showDropdown;
    this.showSettingsDropdown = false;
  }

  onSettingsClick(): void {
    this.showSettingsDropdown = !this.showSettingsDropdown;
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showDropdown = false;
      this.showSettingsDropdown = false;
    }
  }
}
