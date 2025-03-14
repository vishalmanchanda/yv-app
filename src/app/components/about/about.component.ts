import { Component, HostListener } from '@angular/core';
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
  currentSection = 'vision';
  
  sections = [
    { id: 'vision', label: 'Vision', icon: 'fas fa-eye' },
    { id: 'mission', label: 'Mission', icon: 'fas fa-bullseye' },
    { id: 'leadmembers', label: 'Lead Members', icon: 'fas fa-users' },
    { id: 'joinus', label: 'Join Us', icon: 'fas fa-user-plus' }
  ];

  missions = [
    {
      title: 'Democratize IKS',
      icon: 'fas fa-universal-access',
      description: 'Make IKS accessible to all through an engaging AI-powered platform built using our <a href="https://github.com/atmabodha/Vedanta_Datasets" target="_blank">curated datasets on GitHub</a>.'
    },
    {
      title: 'Drive Innovation',
      icon: 'fas fa-rocket',
      description: 'Host biannual hackathons on January 12 (Swami Vivekananda\'s Birth Anniversary) and June 21 (International Day of Yoga) to explore modern applications of IKS.'
    },
    {
      title: 'Cultivate an AI/ML Ecosystem',
      icon: 'fas fa-brain',
      description: 'Build a community of innovators leveraging IKS for impactful solutions.'
    },
    {
      title: 'Create Ethical AI',
      icon: 'fas fa-balance-scale',
      description: 'Develop AI/ML tools that align with IKS values and address societal challenges.'
    },
    {
      title: 'Inspire IKS Literacy',
      icon: 'fas fa-book-reader',
      description: 'Cultivate a generation that appreciates and applies IKS principles in their lives.'
    }
  ];

  teamMembers = [
    {
      name: 'Kushal Shah',
      role: 'IIT Madras alumnus',
      company: 'Educator and Scientist',
      image: 'https://www.yogavivek.org/assets/images/Kushal_Shah.jpeg',
      linkedin: 'https://www.yogavivek.org/assets/images/Kushal_Shah.jpeg'
    },
    {
      name: 'Vishal Manchanda',
      role: 'Senior Principal Technology Architect',
      company: 'Infosys',
      image: 'https://www.yogavivek.org/assets/images/Vishal-Manchanda.jpg',
      linkedin: 'https://www.yogavivek.org/assets/images/Vishal-Manchanda.jpg'
    }
  ];

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.updateActiveSection();
  }

  scrollToSection(sectionId: string) {
    this.currentSection = sectionId;
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }

  private updateActiveSection() {
    const sections = this.sections.map(s => document.getElementById(s.id));
    const headerOffset = 100;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= headerOffset + 50) {
          this.currentSection = this.sections[i].id;
          break;
        }
      }
    }
  }
} 