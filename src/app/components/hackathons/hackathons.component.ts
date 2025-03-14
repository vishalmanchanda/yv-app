import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Hackathon {
  id: string;
  title: string;

  status?: string;
  date?: string;
  prizePool?: string;
  participants?: number;
  projects?: number;
}

@Component({
  selector: 'app-hackathons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hackathons.component.html',
  styleUrls: ['./hackathons.component.scss']
})
export class HackathonsComponent implements OnInit {
  currentYear = new Date().getFullYear();
  
  upcomingHackathons: Hackathon[] = [
    {
      id: 'iyd-2025',
      title: 'IYD Hackathon 2025',

      status: 'Coming Soon',
      date: 'June 2025',
      prizePool: '₹15k'
    }
  ];

  completedHackathons: Hackathon[] = [
    {
      id: 'iyd-2025',
      title: 'NYD Hackathon 2025',

      date: 'January 2025',
      participants: 120,
      projects: 28,
      prizePool: '₹20k'
    }
  ];

  totalPrizeWorth = '35k';

  ngOnInit() {
    // Add any initialization logic here
  }
} 