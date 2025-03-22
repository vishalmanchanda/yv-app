import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HackathonService } from '../../services/hackathon.service';
import { HackathonDetails } from '../../types/hackathon';

@Component({
  selector: 'app-hackathons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hackathons.component.html',
  styleUrls: ['./hackathons.component.scss']
})
export class HackathonsComponent implements OnInit {
  currentYear = new Date().getFullYear();
  
  upcomingHackathons: HackathonDetails[] = [];
  completedHackathons: HackathonDetails[] = [];
  loading = true;

  totalPrizeWorth = '35k';

  constructor(private hackathonService: HackathonService) {}

  ngOnInit() {
    this.loading = true;
    
    // Try the synchronous method first (if data is already loaded)
    if (this.hackathonService.isDataLoaded()) {
      this.processHackathons(this.hackathonService.getAllHackathons());
      this.loading = false;
    } else {
      // Otherwise use async method
      this.hackathonService.getAllHackathonsAsync().subscribe({
        next: (hackathons) => {
          this.processHackathons(hackathons);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading hackathons:', error);
          this.loading = false;
        }
      });
    }
  }

  private processHackathons(hackathons: HackathonDetails[]) {
    // Reset arrays
    this.upcomingHackathons = [];
    this.completedHackathons = [];

    // Sort hackathons into upcoming and completed
    hackathons.forEach(hackathon => {
      if (hackathon.isCompleted) {
        this.completedHackathons.push(hackathon);
      } else {
        this.upcomingHackathons.push(hackathon);
      }
    });

    // Calculate total prize money from all hackathons
    const totalPrize = hackathons.reduce((sum, hackathon) => {
      let hackathonTotal = 0;
      hackathon.prizes.forEach(prize => {
        // Extract numeric value from prize amount (e.g., "INR 20k" -> 20)
        const match = prize.amount.match(/(\d+)/);
        if (match && match[1] && hackathon.isCompleted) {
          hackathonTotal += parseInt(match[1], 10);
        }
      });
      return sum + hackathonTotal;
    }, 0);

    // Format total prize as "35k"
    this.totalPrizeWorth = `${totalPrize}k`;
  }
} 