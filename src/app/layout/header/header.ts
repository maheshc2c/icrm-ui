import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterEvent } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  role: string | null = null;
  sub: string | null = null;
  userId: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role');
      this.sub = localStorage.getItem('sub');
      this.firstName = localStorage.getItem('firstName');
      this.lastName = localStorage.getItem('lastName');
      // this.userId = localStorage.getItem('userId');


    }
  }
}
