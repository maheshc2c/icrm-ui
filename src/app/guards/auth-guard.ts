import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Allow server-side rendering
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = localStorage.getItem('role')?.trim();
  const allowedRoles = (route.data?.['roles'] as string[] | undefined)
    ?.map(role => role?.trim())
    .filter(Boolean);

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
    const normalizedUserRole = userRole.replace(/[\s_]+/g, '').toUpperCase();
    const isAllowed = allowedRoles.some(role => 
      role.replace(/[\s_]+/g, '').toUpperCase() === normalizedUserRole
    );
    if (!isAllowed) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
