import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  collapseNavbar() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse?.classList.contains('show')) {
      (navbarToggler as HTMLElement)?.click();
    }
  }
} 