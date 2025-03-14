import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  currentYear = new Date().getFullYear();
  
  sections = [
    { id: 'vision', label: 'Vision', icon: 'fas fa-eye' },
    { id: 'mission', label: 'Mission', icon: 'fas fa-bullseye' },
    { id: 'leadmembers', label: 'Lead Members', icon: 'fas fa-users' },
    { id: 'joinus', label: 'Join Us', icon: 'fas fa-user-plus' }
  ];

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
} 