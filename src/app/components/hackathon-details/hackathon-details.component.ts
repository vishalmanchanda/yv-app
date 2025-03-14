import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HackathonDetails } from '../../types/hackathon';
import { HackathonService } from '../../services/hackathon.service';

@Component({
  selector: 'app-hackathon-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hackathon-details.component.html',
  styleUrls: ['./hackathon-details.component.scss']
})
export class HackathonDetailsComponent implements OnInit {
  hackathon?: HackathonDetails;
  currentYear = new Date().getFullYear();
  activeSection = 'todo';
  isNavSticky = false;

  sections = [
    { id: 'todo', label: 'Tasks', icon: 'fas fa-tasks' },
    { id: 'rules', label: 'Rules', icon: 'fas fa-gavel' },
    { id: 'participation', label: 'Timeline', icon: 'fas fa-clock' },
    { id: 'sponsors', label: 'Sponsors', icon: 'fas fa-handshake' }
  ];

  constructor(
    private route: ActivatedRoute,
    private hackathonService: HackathonService
  ) {}

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const nav = document.querySelector('.section-nav');
    if (nav) {
      this.isNavSticky = window.pageYOffset > nav.getBoundingClientRect().top;
    }

    // Update active section based on scroll position
    this.updateActiveSection();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hackathon = this.hackathonService.getHackathonDetails(id);
    }
  }

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
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

  getPrizeIcon(position: string): string {
    switch (position.toLowerCase()) {
      case '1st prize': return 'fas fa-trophy text-gold';
      case '2nd prize': return 'fas fa-medal text-silver';
      case '3rd prize': return 'fas fa-award text-bronze';
      default: return 'fas fa-gift';
    }
  }

  private updateActiveSection() {
    const sections = this.sections.map(s => document.getElementById(s.id));
    const navHeight = document.querySelector('.section-nav')?.clientHeight || 0;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= navHeight + 100) {
          this.activeSection = this.sections[i].id;
          break;
        }
      }
    }
  }
} 